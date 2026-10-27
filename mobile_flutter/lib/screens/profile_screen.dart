import 'package:flutter/material.dart' hide Card, Badge;

import '../api.dart' as api;
import '../theme.dart';
import '../widgets.dart';

Color otaBadgeColor(String state) {
  switch (state) {
    case 'checking':
      return C.gold;
    case 'downloading':
      return C.blue;
    case 'ready':
      return C.green;
    case 'offline':
      return C.orange;
    case 'latest':
      return C.green;
    default:
      return C.textMuted;
  }
}

class ProfileScreen extends StatefulWidget {
  final Map<String, dynamic> student;
  final List<dynamic> courses;
  final void Function() onSignOut;
  final void Function(String message) notify;
  const ProfileScreen({
    super.key,
    required this.student,
    required this.courses,
    required this.onSignOut,
    required this.notify,
  });

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool notifications = true;
  String otaState = 'idle';
  String otaMessage = 'Install the latest learning bundle from the school server.';
  int received = 0;
  int total = 0;

  void setOta(String state, String message) {
    if (!mounted) return;
    setState(() {
      otaState = state;
      otaMessage = message;
      if (state != 'downloading') {
        received = 0;
        total = 0;
      }
    });
  }

  Future<void> handleCheckUpdate() async {
    setOta('checking', 'Contacting the school server...');
    final result = await api.checkAppUpdate();
    if (!mounted) return;

    if (!result.ok) {
      setOta('offline', 'Update server unreachable. Offline lessons keep working.');
      widget.notify('Update server unavailable.');
      return;
    }

    final data = result.data as Map<String, dynamic>;
    if (data['updateAvailable'] == true) {
      final version = (data['version'] ?? '').toString();
      setOta('ready', 'Version $version is available. Tap Download & Install to get it.');
      widget.notify('Update v$version is ready to install.');
    } else {
      setOta('latest', 'Installed v${api.APP_VERSION} is the latest bundle. Your courses are fully synced.');
      widget.notify("You're on the latest version.");
    }
  }

  Future<void> handleDownloadInstall() async {
    setOta('downloading', 'Downloading update... 0%');
    final result = await api.downloadAndInstallApk((r, t) {
      final pct = t > 0 ? (r * 100 / t).round() : 0;
      if (mounted && pct % 5 == 0) {
        setState(() {
          received = r;
          total = t;
          otaMessage = 'Downloading update... $pct%';
        });
      }
    });
    if (!mounted) return;
    if (result.ok) {
      setOta('ready', 'Download complete - the installer is opening. Confirm to finish the update.');
    } else {
      setOta('idle', result.message);
      widget.notify(result.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final student = widget.student;
    int totalLessons = 0;
    int done = 0;
    for (final c in widget.courses) {
      final lessons = (c['lessons'] as List<dynamic>? ?? []);
      totalLessons += lessons.length;
      done += lessons.where((l) => l['completed'] == true).length;
    }

    final (otaFg, otaBg) = (
      otaBadgeColor(otaState),
      otaState == 'latest' || otaState == 'ready'
          ? (otaState == 'latest' ? C.greenSoft : C.greenSoft)
          : C.surfaceRaised
    );
    final badgeLabel = switch (otaState) {
      'checking' => 'Checking',
      'downloading' => 'Downloading',
      'ready' => 'Update ready',
      'latest' => 'Up to date',
      'offline' => 'Offline',
      _ => 'Ready',
    };

    return Scaffold(
      backgroundColor: C.bg,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(22, 22, 22, 30),
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('MY ACCOUNT', style: T.eyebrow.copyWith(fontSize: 9)),
                      const SizedBox(height: 6),
                      Text('Profile', style: T.h2),
                    ],
                  ),
                ),
                Badge(label: (student['role'] ?? '').toString() == 'teacher' ? 'TEACHER' : 'STUDENT'),
              ],
            ),
            const SizedBox(height: 20),
            Card(
              child: Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: C.goldSoft,
                      border: Border.all(color: C.gold.withValues(alpha: 0.38), width: 1),
                    ),
                    alignment: Alignment.center,
                    child: Text((student['initials'] ?? '').toString(),
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: C.gold)),
                  ),
                  const SizedBox(height: 12),
                  Text((student['name'] ?? '').toString(), style: T.h2.copyWith(fontSize: 19)),
                  const SizedBox(height: 3),
                  Text((student['email'] ?? '').toString(), style: T.tiny.copyWith(fontSize: 11.5)),
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(13),
                    decoration: BoxDecoration(
                      color: C.surfaceAlt,
                      borderRadius: BorderRadius.circular(T.rMd),
                      border: Border.all(color: C.border, width: 1),
                    ),
                    child: Column(
                      children: [
                        _kv('ID', (student['id'] ?? '').toString()),
                        const SizedBox(height: 7),
                        _kv('Program', (student['program'] ?? '').toString()),
                        const SizedBox(height: 7),
                        _kv('Cohort', (student['cohort'] ?? '').toString()),
                        const SizedBox(height: 7),
                        _kv('Lessons done', '$done of $totalLessons'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // ---- updates card (server-side APK updater) ----
            Card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text('APP UPDATES', style: T.eyebrow.copyWith(fontSize: 9)),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                        decoration: BoxDecoration(
                          color: otaBg,
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(color: otaFg.withValues(alpha: 0.3), width: 1),
                        ),
                        child: Text(badgeLabel,
                            style: TextStyle(fontSize: 9.5, height: 1.3, fontWeight: FontWeight.w700, color: otaFg)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(otaMessage, style: T.small.copyWith(height: 1.5)),
                  const SizedBox(height: 13),
                  if (otaState == 'ready')
                    GoldButton(
                      label: 'Download & install',
                      onPress: handleDownloadInstall,
                      icon: Icons.download_rounded,
                    )
                  else if (otaState == 'downloading')
                    Column(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(999),
                          child: Container(
                            height: 5,
                            color: C.border,
                            child: FractionallySizedBox(
                              alignment: Alignment.centerLeft,
                              widthFactor:
                                  total > 0 ? (received / total).clamp(0.05, 1.0) : 0.05,
                              child: Container(color: C.gold),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                      ],
                    ),
                  GhostButton(
                    label: otaState == 'checking' ? 'Checking the server...' : 'Check for app updates',
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    icon: Icons.sync_rounded,
                    onPress: otaState == 'checking' || otaState == 'downloading' ? null : handleCheckUpdate,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // settings toggles
            Card(
              child: Column(
                children: [
                  _toggleTile('Notifications', notifications, (v) => setState(() => notifications = v)),
                  Container(height: 1, color: C.border),
                  _toggleTile('Auto-updates', otaState != 'idle', (v) {
                    showToast(
                      context,
                      v ? 'Auto-updates are handled by the school server.' : 'You can still check updates manually.',
                    );
                  }),
                ],
              ),
            ),
            const SizedBox(height: 14),
            Card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('ABOUT', style: T.eyebrow.copyWith(fontSize: 9)),
                  const SizedBox(height: 10),
                  Text('MindLink.AI Student Portal', style: T.h3),
                  Text('Version ${api.APP_VERSION} (build ${api.APP_BUILD})', style: T.tiny.copyWith(fontSize: 11)),
                  const SizedBox(height: 6),
                  Text('Content, notices and updates come straight from your school server.', style: T.tiny),
                ],
              ),
            ),
            const SizedBox(height: 14),
            GhostButton(
              label: 'Sign out',
              icon: Icons.logout_rounded,
              onPress: widget.onSignOut,
            ),
          ],
        ),
      ),
    );
  }

  Widget _kv(String k, String v) => Row(
        children: [
          SizedBox(width: 104, child: Text(k, style: T.tiny)),
          Expanded(
            child: Text(v, style: T.small.copyWith(color: C.text, fontWeight: FontWeight.w600),
                textAlign: TextAlign.right),
          ),
        ],
      );

  Widget _toggleTile(String label, bool value, ValueChanged<bool> onToggle) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2),
      child: Row(
        children: [
          Expanded(child: Text(label, style: T.small.copyWith(color: C.text, fontWeight: FontWeight.w600))),
          Switch(value: value, activeTrackColor: C.goldSoft, activeThumbColor: C.gold, onChanged: onToggle, inactiveThumbColor: const Color(0xFF8A8177)),
        ],
      ),
    );
  }
}
