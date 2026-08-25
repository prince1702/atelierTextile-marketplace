export function createWatermarkedCanvasUrl(
  imageUrl: string,
  watermarkText = 'TexDesigner',
  density: 'compact' | 'normal' | 'dense' = 'normal'
): Promise<string> {
  return new Promise((resolve) => {
    if (!imageUrl) return resolve('');

    // Return Data URLs as-is if already watermarked
    if (imageUrl.startsWith('data:image/jpeg;base64,')) {
      return resolve(imageUrl);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || img.width || 800;
        const height = img.naturalHeight || img.height || 600;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageUrl);

        // 1. Draw base design image
        ctx.drawImage(img, 0, 0, width, height);

        // 2. Prepare watermark pattern SVG (50% density, light color)
        const displayText = watermarkText.toUpperCase();
        const tileSize = density === 'compact' ? 260 : density === 'dense' ? 220 : 240;
        const fontSize = Math.max(14, Math.round(tileSize / 15));

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize}" height="${tileSize}" viewBox="0 0 ${tileSize} ${tileSize}">
          <style>
            .wm-text {
              font-family: system-ui, -apple-system, sans-serif;
              font-weight: 800;
              font-size: ${fontSize}px;
              letter-spacing: 2.5px;
              fill: rgba(255, 255, 255, 0.65);
              stroke: rgba(0, 0, 0, 0.3);
              stroke-width: 1.5px;
              paint-order: stroke fill;
            }
          </style>
          <g transform="rotate(-30 ${tileSize / 2} ${tileSize / 2})">
            <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" class="wm-text">${displayText}</text>
          </g>
        </svg>`;

        const patternImg = new Image();
        patternImg.onload = () => {
          try {
            const pattern = ctx.createPattern(patternImg, 'repeat');
            if (pattern) {
              ctx.fillStyle = pattern;
              ctx.globalAlpha = 0.55;
              ctx.fillRect(0, 0, width, height);
            }
            resolve(canvas.toDataURL('image/jpeg', 0.92));
          } catch {
            resolve(imageUrl);
          }
        };
        patternImg.onerror = () => resolve(imageUrl);
        patternImg.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      } catch {
        resolve(imageUrl);
      }
    };

    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}
