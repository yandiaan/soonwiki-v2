const MAX_DIMENSION = 1600;
const TARGET_MAX_BYTES = 1.5 * 1024 * 1024;

export interface CompressImageOptions {
  square?: boolean;
}

export async function compressImageToWebP(
  file: File,
  options: CompressImageOptions = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

  const sourceSize = options.square ? Math.min(bitmap.width, bitmap.height) : null;
  const sourceWidth = sourceSize ?? bitmap.width;
  const sourceHeight = sourceSize ?? bitmap.height;
  const sourceX = sourceSize ? (bitmap.width - sourceSize) / 2 : 0;
  const sourceY = sourceSize ? (bitmap.height - sourceSize) / 2 : 0;

  const scale = Math.min(1, MAX_DIMENSION / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas tidak didukung di perangkat ini.');
  }

  context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);

  let quality = 0.85;
  let blob = await canvasToBlob(canvas, quality);

  while (blob.size > TARGET_MAX_BYTES && quality > 0.4) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, quality);
  }

  return blob;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Gagal memproses gambar.'));
        }
      },
      'image/webp',
      quality,
    );
  });
}
