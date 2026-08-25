export function createSvgCompositeDataUrl(
  imageUrl: string,
  watermarkText = 'TexDesigner',
  density: 'compact' | 'normal' | 'dense' = 'normal'
): string {
  if (!imageUrl) return '';
  
  const displayText = watermarkText.toUpperCase();
  const tileSize = density === 'compact' ? 260 : density === 'dense' ? 220 : 240;
  const fontSize = 15;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%">
    <defs>
      <pattern id="wmPattern" width="${tileSize}" height="${tileSize}" patternUnits="userSpaceOnUse">
        <g transform="rotate(-30 ${tileSize / 2} ${tileSize / 2})">
          <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.85)" stroke="rgba(0,0,0,0.55)" stroke-width="1.8" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="${fontSize}px" letter-spacing="2.5px">${displayText}</text>
        </g>
      </pattern>
    </defs>
    <image href="${imageUrl}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
    <rect width="100%" height="100%" fill="url(#wmPattern)" opacity="0.70"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createWatermarkedCanvasUrl(
  imageUrl: string,
  watermarkText = 'TexDesigner',
  density: 'compact' | 'normal' | 'dense' = 'normal'
): Promise<string> {
  return new Promise((resolve) => {
    if (!imageUrl) return resolve('');

    // If it's already a watermarked data URL, return as is
    if (imageUrl.startsWith('data:image/')) {
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
        if (!ctx) {
          return resolve(createSvgCompositeDataUrl(imageUrl, watermarkText, density));
        }

        // 1. Draw base design image
        ctx.drawImage(img, 0, 0, width, height);

        // 2. Prepare watermark pattern SVG
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
              fill: rgba(255, 255, 255, 0.85);
              stroke: rgba(0, 0, 0, 0.55);
              stroke-width: 1.8px;
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
              ctx.globalAlpha = 0.70;
              ctx.fillRect(0, 0, width, height);
            }
            resolve(canvas.toDataURL('image/jpeg', 0.92));
          } catch {
            // If canvas export fails due to CORS, use SVG Composite Data URL fallback
            resolve(createSvgCompositeDataUrl(imageUrl, watermarkText, density));
          }
        };
        patternImg.onerror = () => resolve(createSvgCompositeDataUrl(imageUrl, watermarkText, density));
        patternImg.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      } catch {
        resolve(createSvgCompositeDataUrl(imageUrl, watermarkText, density));
      }
    };

    img.onerror = () => resolve(createSvgCompositeDataUrl(imageUrl, watermarkText, density));
    img.src = imageUrl;
  });
}
