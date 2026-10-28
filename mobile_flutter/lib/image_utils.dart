import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path_provider/path_provider.dart';

/// Keep uploads comfortably below the server's 5 MB ceiling.
const int maxIdCardUploadBytes = 4500 * 1024;

/// Progressive fallbacks: first try good quality, then trade resolution for
/// size until the file fits.
const List<({int quality, int maxDimension})> _attempts = [
  (quality: 85, maxDimension: 1600),
  (quality: 70, maxDimension: 1400),
  (quality: 55, maxDimension: 1200),
  (quality: 40, maxDimension: 1000),
  (quality: 30, maxDimension: 800),
];

/// Re-encodes an ID card photo as JPEG when it is too large to upload.
///
/// Small files are returned untouched. If the native compressor cannot read
/// the image, the original file is returned too - the server also optimises
/// uploads, so the request can still go through.
Future<File> prepareIdCardImage(File source) async {
  try {
    if (await source.length() <= maxIdCardUploadBytes) return source;

    final tempDir = await getTemporaryDirectory();
    final stamp = DateTime.now().microsecondsSinceEpoch;
    File? smallest;

    for (var i = 0; i < _attempts.length; i++) {
      final attempt = _attempts[i];
      final bytes = await FlutterImageCompress.compressWithFile(
        source.absolute.path,
        minWidth: attempt.maxDimension,
        minHeight: attempt.maxDimension,
        quality: attempt.quality,
        format: CompressFormat.jpeg,
        autoCorrectionAngle: true,
        keepExif: false,
      );
      if (bytes == null || bytes.isEmpty) continue;

      final candidate = File('${tempDir.path}/id-card-$stamp-$i.jpg');
      await candidate.writeAsBytes(bytes, flush: true);
      final size = await candidate.length();

      if (size <= maxIdCardUploadBytes) {
        if (smallest != null) await _deleteQuietly(smallest);
        return candidate;
      }

      if (smallest == null || size < await smallest.length()) {
        if (smallest != null) await _deleteQuietly(smallest);
        smallest = candidate;
      } else {
        await _deleteQuietly(candidate);
      }
    }

    return smallest ?? source;
  } catch (err) {
    debugPrint('ID card compression failed: $err');
    return source;
  }
}

Future<void> _deleteQuietly(File file) async {
  try {
    await file.delete();
  } catch (_) {
    // Temp files are cleaned by the OS anyway.
  }
}
