import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:open_filex/open_filex.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// App version shown everywhere and compared against the server release.
const APP_VERSION = '1.3.1';
const APP_BUILD = '5';

/// School server (laptop funnel now, Proxmox later).
const API_BASE_URL = 'https://niko.tailf5f9d7.ts.net';

class ApiResult {
  final bool ok;
  final int status;
  final dynamic data;
  final String message;
  const ApiResult({required this.ok, required this.status, this.data, this.message = ''});
}

/* ------------------------------------------------------------------ */
/* Session persistence                                                 */
/* ------------------------------------------------------------------ */

const _sessionKey = 'mindlink.session';
const _contentKey = 'mindlink.content';

Future<void> saveSession(Map<String, dynamic> session) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString(_sessionKey, jsonEncode(session));
}

Future<Map<String, dynamic>?> loadSession() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_sessionKey);
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  } catch (_) {
    return null;
  }
}

Future<void> clearSession() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.remove(_sessionKey);
}

/// Map a backend account onto the fields the screens use.
Map<String, dynamic>? toStudent(dynamic user) {
  if (user == null) return null;
  final name = (user['name'] ?? 'Member').toString();
  final parts = name.split(RegExp(r'\s+')).where((p) => p.isNotEmpty).take(2).toList();
  final initials = parts.map((p) => p.isNotEmpty ? p[0].toUpperCase() : '').join();
  final isTeacher = user['role'] == 'teacher';
  return {
    'id': (user['rollNumber'] ?? '').isNotEmpty ? user['rollNumber'] : 'ML-${user['id']}',
    'name': name,
    'firstName': name.split(RegExp(r'\s+')).first,
    'initials': initials,
    'email': user['email'],
    'role': user['role'] ?? 'student',
    'rollNumber': user['rollNumber'] ?? '',
    'program': isTeacher ? 'Teacher · Faculty' : 'Student · Enrolled',
    'cohort': isTeacher ? 'Faculty Portal' : 'Cohort 12 · Section A',
    'weeklyGoal': 5,
    'weeklyHours': 0,
  };
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

Future<ApiResult> login(String email, String password) async {
  try {
    final res = await http
        .post(
          Uri.parse('$API_BASE_URL/api/auth/login'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'email': email, 'password': password}),
        )
        .timeout(const Duration(seconds: 12));
    final body = jsonDecode(res.body);
    if (res.statusCode == 200) return ApiResult(ok: true, status: 200, data: body);
    // message can be a plain string or a {code,status,message} object
    final msg = body['message'];
    final friendly = msg is Map
        ? (msg['message'] ?? 'Login failed').toString()
        : (msg ?? 'Login failed').toString();
    return ApiResult(ok: false, status: res.statusCode, data: body, message: friendly);
  } on TimeoutException {
    return const ApiResult(ok: false, status: 0, message: 'The server took too long to respond.');
  } catch (e) {
    return ApiResult(ok: false, status: 0, message: 'Cannot reach the school server. Try again.');
  }
}

MediaType _imageMediaType(String path) {
  final lower = path.toLowerCase();
  if (lower.endsWith('.png')) return MediaType('image', 'png');
  if (lower.endsWith('.webp')) return MediaType('image', 'webp');
  return MediaType('image', 'jpeg');
}

Future<ApiResult> register({
  required String role,
  required String name,
  required String email,
  required String phone,
  required String rollNumber,
  required String password,
  required File? idCardFront,
  required File? idCardBack,
}) async {
  try {
    final req = http.MultipartRequest('POST', Uri.parse('$API_BASE_URL/api/auth/register'))
      ..fields['role'] = role
      ..fields['name'] = name
      ..fields['email'] = email
      ..fields['phone'] = phone
      ..fields['rollNumber'] = rollNumber
      ..fields['password'] = password;
    if (idCardFront != null) {
      req.files.add(await http.MultipartFile.fromPath(
        'idCardFront',
        idCardFront.path,
        contentType: _imageMediaType(idCardFront.path),
      ));
    }
    if (idCardBack != null) {
      req.files.add(await http.MultipartFile.fromPath(
        'idCardBack',
        idCardBack.path,
        contentType: _imageMediaType(idCardBack.path),
      ));
    }
    final streamed = await req.send().timeout(const Duration(seconds: 60));
    final res = await http.Response.fromStream(streamed);
    final body = jsonDecode(res.body);
    // success body carries requestId for the pending screen
    if (res.statusCode == 201 || res.statusCode == 200) {
      return ApiResult(ok: true, status: res.statusCode, data: body);
    }
    final msg = body['message'];
    return ApiResult(ok: false, status: res.statusCode, message: (msg ?? 'Signup failed').toString());
  } on TimeoutException {
    return const ApiResult(ok: false, status: 0, message: 'Upload took too long. Check your connection.');
  } catch (e) {
    return ApiResult(ok: false, status: 0, message: 'Cannot reach the school server. Try again.');
  }
}

/* ------------------------------------------------------------------ */
/* Server-driven content (courses, notices, texts)                     */
/* ------------------------------------------------------------------ */

Future<ApiResult> fetchContent() async {
  try {
    final res = await http
        .get(Uri.parse('$API_BASE_URL/api/content'))
        .timeout(const Duration(seconds: 12));
    final body = jsonDecode(res.body);
    if (res.statusCode == 200 && body['success'] == true) {
      // cache for offline launches
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_contentKey, res.body);
      return ApiResult(ok: true, status: 200, data: body);
    }
    return ApiResult(ok: false, status: res.statusCode, message: 'Content server error');
  } catch (e) {
    // fall back to the last cached copy
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_contentKey);
      if (raw != null) {
        final cached = jsonDecode(raw);
        return ApiResult(ok: true, status: 0, data: cached);
      }
    } catch (_) {}
    return ApiResult(ok: false, status: 0, message: 'Offline - no cached content yet.');
  }
}

/* ------------------------------------------------------------------ */
/* In-app updater (APK served by the school server)                     */
/* ------------------------------------------------------------------ */

int _semverToNum(String v) {
  final parts = v.split('.').map((n) => int.tryParse(n) ?? 0).toList();
  while (parts.length < 3) parts.add(0);
  return (parts[0] * 1_000_000) + (parts[1] * 1_000) + parts[2];
}

bool isNewer(String server, String client) => _semverToNum(server) > _semverToNum(client);

Future<ApiResult> checkAppUpdate() async {
  try {
    final res = await http
        .get(Uri.parse('$API_BASE_URL/api/app/latest'))
        .timeout(const Duration(seconds: 12));
    final body = jsonDecode(res.body);
    if (res.statusCode == 200) {
      final version = body['version'];
      final updateAvailable = version != null && isNewer(version.toString(), APP_VERSION);
      return ApiResult(
        ok: true,
        status: 200,
        data: {...Map<String, dynamic>.from(body), 'updateAvailable': updateAvailable},
      );
    }
    return ApiResult(ok: false, status: res.statusCode, message: 'Update server error');
  } catch (e) {
    return ApiResult(ok: false, status: 0, message: 'Update server unreachable.');
  }
}

/// Streams the release APK to a temp file and opens the Android installer.
Future<ApiResult> downloadAndInstallApk(
  void Function(int received, int total) onProgress,
) async {
  try {
    final client = http.Client();
    final request = http.Request('GET', Uri.parse('$API_BASE_URL/api/app/apk'));
    final response = await client.send(request).timeout(const Duration(seconds: 90));
    if (response.statusCode != 200) {
      client.close();
      return ApiResult(ok: false, status: response.statusCode, message: 'Server returned ${response.statusCode}');
    }
    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}/mindlink-student.apk');
    final sink = file.openWrite();
    final total = response.contentLength ?? 0;
    var received = 0;
    await for (final chunk in response.stream) {
      received += chunk.length;
      sink.add(chunk);
      onProgress(received, total);
    }
    await sink.flush();
    await sink.close();
    client.close();
    final open = await OpenFilex.open(file.path);
    if (open.type != ResultType.done) {
      return ApiResult(ok: false, status: 0, message: 'Installer could not open the file.');
    }
    return const ApiResult(ok: true, status: 200);
  } catch (e) {
    return ApiResult(ok: false, status: 0, message: 'Download failed. Try again on Wi-Fi.');
  }
}
