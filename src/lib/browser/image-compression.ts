const MAX_DIMENSION = 1600;
const TARGET_MAX_BYTES = 2.0 * 1024 * 1024;

export interface CompressImageOptions {
  square?: boolean;
  maxDimension?: number;
  quality?: number;
}

interface ImageSourceDimensions {
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup?: () => void;
}

async function getImageSource(file: File): Promise<ImageSourceDimensions> {
  // Strategy 1: Modern createImageBitmap with orientation
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => {
          if ('close' in bitmap && typeof bitmap.close === 'function') {
            bitmap.close();
          }
        },
      };
    } catch {
      // Fall through to HTMLImageElement fallback
    }
  }

  // Strategy 2: HTMLImageElement via object URL
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({
        source: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        cleanup: () => URL.revokeObjectURL(url),
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Format file gambar tidak dapat dibaca. Coba gunakan format JPG atau PNG.'));
    };

    img.src = url;
  });
}

export async function compressImageToWebP(
  file: File,
  options: CompressImageOptions = {},
): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File yang dipilih bukan gambar.');
  }

  const { source, width: rawWidth, height: rawHeight, cleanup } = await getImageSource(file);

  try {
    const maxDim = options.maxDimension ?? MAX_DIMENSION;
    const sourceSize = options.square ? Math.min(rawWidth, rawHeight) : null;
    const sourceWidth = sourceSize ?? rawWidth;
    const sourceHeight = sourceSize ?? rawHeight;
    const sourceX = sourceSize ? (rawWidth - sourceSize) / 2 : 0;
    const sourceY = sourceSize ? (rawHeight - sourceSize) / 2 : 0;

    const scale = Math.min(1, maxDim / Math.max(sourceWidth, sourceHeight));
    const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
    const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d', { alpha: !options.square });

    if (!context) {
      throw new Error('Canvas 2D tidak didukung pada browser ini.');
    }

    // High quality rendering
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    context.drawImage(
      source,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      targetWidth,
      targetHeight,
    );

    let quality = options.quality ?? 0.88;
    let blob = await canvasToBlob(canvas, 'image/webp', quality);

    // Fallback to JPEG if WebP is not returned
    if (!blob || blob.type !== 'image/webp') {
      blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    }

    while (blob.size > TARGET_MAX_BYTES && quality > 0.45) {
      quality -= 0.1;
      blob = await canvasToBlob(canvas, 'image/webp', quality);
    }

    return blob;
  } finally {
    cleanup?.();
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Gagal mengonversi gambar.'));
        }
      },
      type,
      quality,
    );
  });
}
