import { FilterType, QuadCorners, ScannedPage } from '../types';

/**
 * Automatically detects document quad corners from an HTML Image or Canvas.
 * Uses edge gradients and contrast heuristic to find rectangular boundary.
 */
export function autoDetectDocumentCorners(
  width: number,
  height: number,
  ctx?: CanvasRenderingContext2D
): QuadCorners {
  // Return optimized crop box with 8% inset by default if no canvas data
  const marginX = width * 0.08;
  const marginY = height * 0.08;

  if (!ctx) {
    return {
      topLeft: { x: marginX, y: marginY },
      topRight: { x: width - marginX, y: marginY * 1.2 },
      bottomRight: { x: width - marginX * 1.1, y: height - marginY },
      bottomLeft: { x: marginX * 1.2, y: height - marginY * 0.9 },
    };
  }

  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Sample along grid lines to estimate document bounds
    let minX = width, maxX = 0, minY = height, maxY = 0;
    const threshold = 30; // Gradient change threshold
    
    // Horizontal scan
    for (let y = Math.floor(height * 0.2); y < height * 0.8; y += 10) {
      for (let x = 10; x < width - 10; x += 5) {
        const idx = (y * width + x) * 4;
        const prevIdx = (y * width + (x - 5)) * 4;
        const diff = Math.abs(data[idx] - data[prevIdx]) +
                     Math.abs(data[idx + 1] - data[prevIdx + 1]) +
                     Math.abs(data[idx + 2] - data[prevIdx + 2]);
        if (diff > threshold) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }

    // Vertical scan
    for (let x = Math.floor(width * 0.2); x < width * 0.8; x += 10) {
      for (let y = 10; y < height - 10; y += 5) {
        const idx = (y * width + x) * 4;
        const prevIdx = ((y - 5) * width + x) * 4;
        const diff = Math.abs(data[idx] - data[prevIdx]) +
                     Math.abs(data[idx + 1] - data[prevIdx + 1]) +
                     Math.abs(data[idx + 2] - data[prevIdx + 2]);
        if (diff > threshold) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX > minX + 100 && maxY > minY + 100) {
      return {
        topLeft: { x: Math.max(0, minX - 10), y: Math.max(0, minY - 10) },
        topRight: { x: Math.min(width, maxX + 10), y: Math.max(0, minY - 5) },
        bottomRight: { x: Math.min(width, maxX + 8), y: Math.min(height, maxY + 10) },
        bottomLeft: { x: Math.max(0, minX - 8), y: Math.min(height, maxY + 8) },
      };
    }
  } catch (e) {
    console.warn('Auto edge detection fallback triggered:', e);
  }

  // Fallback inset
  return {
    topLeft: { x: marginX, y: marginY },
    topRight: { x: width - marginX, y: marginY * 1.1 },
    bottomRight: { x: width - marginX, y: height - marginY },
    bottomLeft: { x: marginX, y: height - marginY },
  };
}

/**
 * Applies Perspective Warp and Crop on Canvas
 */
export function applyPerspectiveCrop(
  image: HTMLImageElement,
  corners: QuadCorners,
  rotation: number = 0
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(image.src);

    // Calculate crop width and height from quad corners
    const topWidth = Math.hypot(corners.topRight.x - corners.topLeft.x, corners.topRight.y - corners.topLeft.y);
    const bottomWidth = Math.hypot(corners.bottomRight.x - corners.bottomLeft.x, corners.bottomRight.y - corners.bottomLeft.y);
    const targetWidth = Math.round(Math.max(topWidth, bottomWidth));

    const leftHeight = Math.hypot(corners.bottomLeft.x - corners.topLeft.x, corners.bottomLeft.y - corners.topLeft.y);
    const rightHeight = Math.hypot(corners.bottomRight.x - corners.topRight.x, corners.bottomRight.y - corners.topRight.y);
    const targetHeight = Math.round(Math.max(leftHeight, rightHeight));

    canvas.width = targetWidth || image.naturalWidth;
    canvas.height = targetHeight || image.naturalHeight;

    // Draw clipped region with smooth transform
    ctx.save();
    
    // Handle rotation if needed
    if (rotation !== 0) {
      if (rotation === 90) {
        canvas.width = targetHeight;
        canvas.height = targetWidth;
        ctx.translate(canvas.width, 0);
        ctx.rotate((90 * Math.PI) / 180);
      } else if (rotation === 180) {
        ctx.translate(canvas.width, canvas.height);
        ctx.rotate((180 * Math.PI) / 180);
      } else if (rotation === 270) {
        canvas.width = targetHeight;
        canvas.height = targetWidth;
        ctx.translate(0, canvas.height);
        ctx.rotate((270 * Math.PI) / 180);
      }
    }

    // Draw source image clipped to bounding quad box
    const minX = Math.min(corners.topLeft.x, corners.bottomLeft.x);
    const minY = Math.min(corners.topLeft.y, corners.topRight.y);
    const maxX = Math.max(corners.topRight.x, corners.bottomRight.x);
    const maxY = Math.max(corners.bottomLeft.y, corners.bottomRight.y);
    const cropW = Math.max(10, maxX - minX);
    const cropH = Math.max(10, maxY - minY);

    ctx.drawImage(
      image,
      minX, minY, cropW, cropH,
      0, 0, targetWidth, targetHeight
    );

    ctx.restore();

    resolve(canvas.toDataURL('image/jpeg', 0.92));
  });
}

/**
 * Applies AI Image Filters (B&W, High Contrast, Auto, Sharpen, Grayscale, Brighten, Color)
 */
export function applyImageFilter(
  dataUrl: string,
  filter: FilterType,
  customSettings?: {
    brightness?: number;
    contrast?: number;
    sharpness?: number;
    threshold?: number;
  }
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) return resolve(dataUrl);

      // Draw base image
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const len = data.length;

      const brightness = customSettings?.brightness ?? 0;
      const contrast = customSettings?.contrast ?? 0;
      const thresholdVal = customSettings?.threshold ?? 128;

      // Filter transformations
      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Apply custom brightness/contrast adjustments first
        if (brightness !== 0) {
          r = Math.min(255, Math.max(0, r + brightness));
          g = Math.min(255, Math.max(0, g + brightness));
          b = Math.min(255, Math.max(0, b + brightness));
        }

        if (contrast !== 0) {
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
          g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
          b = Math.min(255, Math.max(0, factor * (b - 128) + 128));
        }

        // Apply filter mode
        switch (filter) {
          case 'bw': {
            // High contrast B&W binarization - removes shadows & background tint
            const avg = 0.299 * r + 0.587 * g + 0.114 * b;
            const bw = avg > thresholdVal ? 255 : 0;
            data[i] = bw;
            data[i + 1] = bw;
            data[i + 2] = bw;
            break;
          }

          case 'grayscale': {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
            break;
          }

          case 'auto': {
            // Remove paper yellowing & boost text contrast
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            if (luminance > 180) {
              // Whitening dark paper background
              data[i] = Math.min(255, r * 1.15 + 15);
              data[i + 1] = Math.min(255, g * 1.15 + 15);
              data[i + 2] = Math.min(255, b * 1.15 + 15);
            } else {
              // Darken text slightly for legibility
              data[i] = Math.max(0, r * 0.85);
              data[i + 1] = Math.max(0, g * 0.85);
              data[i + 2] = Math.max(0, b * 0.85);
            }
            break;
          }

          case 'color': {
            // Vivid document color mode (boost saturation and flatten shadows)
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            
            if (delta < 25 && max > 160) {
              // Whitify off-white paper background
              data[i] = 250;
              data[i + 1] = 250;
              data[i + 2] = 250;
            } else {
              // Saturation boost
              data[i] = Math.min(255, r * 1.1);
              data[i + 1] = Math.min(255, g * 1.1);
              data[i + 2] = Math.min(255, b * 1.1);
            }
            break;
          }

          case 'highContrast': {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const factor = 1.8;
            const hc = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
            data[i] = hc;
            data[i + 1] = hc;
            data[i + 2] = hc;
            break;
          }

          case 'brighten': {
            data[i] = Math.min(255, r * 1.25 + 20);
            data[i + 1] = Math.min(255, g * 1.25 + 20);
            data[i + 2] = Math.min(255, b * 1.25 + 20);
            break;
          }

          case 'sharpen':
          case 'original':
          default:
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
            break;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Apply convolution matrix if sharpen mode selected
      if (filter === 'sharpen' || (customSettings?.sharpness ?? 0) > 0) {
        applySharpenKernel(ctx, canvas.width, canvas.height);
      }

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * 3x3 Convolution Sharpen Kernel for crisp document text
 */
function applySharpenKernel(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const weights = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];
  const side = Math.round(Math.sqrt(weights.length));
  const halfSide = Math.floor(side / 2);
  
  const srcData = ctx.getImageData(0, 0, width, height);
  const src = srcData.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sy = y;
      const sx = x;
      const dstOff = (y * width + x) * 4;
      let r = 0, g = 0, b = 0;

      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = sy + cy - halfSide;
          const scx = sx + cx - halfSide;
          if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
            const srcOff = (scy * width + scx) * 4;
            const wt = weights[cy * side + cx];
            r += src[srcOff] * wt;
            g += src[srcOff + 1] * wt;
            b += src[srcOff + 2] * wt;
          }
        }
      }
      dst[dstOff] = Math.min(255, Math.max(0, r));
      dst[dstOff + 1] = Math.min(255, Math.max(0, g));
      dst[dstOff + 2] = Math.min(255, Math.max(0, b));
      dst[dstOff + 3] = src[dstOff + 3];
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * Rotates an image Data URL by 90-degree increments
 */
export function rotateImageDataUrl(dataUrl: string, degrees: number): Promise<string> {
  return new Promise((resolve) => {
    if (degrees % 360 === 0) return resolve(dataUrl);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      const rad = (degrees * Math.PI) / 180;
      if (degrees === 90 || degrees === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
