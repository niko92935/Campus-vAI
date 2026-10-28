import sharp from 'sharp';

/**
 * Some mobile HTTP clients send `application/octet-stream` instead of a real
 * image mime type, so trust the file signature rather than the header.
 */
export function isAllowedImage(file: any): boolean {
  const buffer: Buffer | undefined = file?.buffer;
  if (!buffer || buffer.length < 12) return false;

  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;

  // PNG
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.subarray(0, 8).equals(png)) return true;

  // WebP: "RIFF" .... "WEBP"
  return (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  );
}

/**
 * Normalises an ID card photo to a reasonably sized JPEG. Returns null when
 * sharp cannot decode the file, in which case the caller keeps the original.
 */
export async function optimiseIdCard(buffer: Buffer): Promise<Buffer | null> {
  try {
    const output = await sharp(buffer, { failOn: 'none' })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
    return output.length > 0 ? output : null;
  } catch (err: any) {
    console.warn(`[upload] image optimisation failed: ${err?.message || err}`);
    return null;
  }
}
