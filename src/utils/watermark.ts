export function createSvgCompositeDataUrl(
  imageUrl: string,
  watermarkText = 'TexDesigner',
  density: 'compact' | 'normal' | 'dense' = 'normal',
  designId?: string
): string {
  if (!imageUrl) return '';
  
  const displayText = watermarkText.toUpperCase();
  const tileSize = density === 'compact' ? 260 : density === 'dense' ? 220 : 240;
  const fontSize = 15;
  const badgeText = designId ? (designId.startsWith('ID:') ? designId : `ID: ${designId}`) : '';
  const badgeWidth = Math.max(84, badgeText.length * 9.5 + 20);

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
    ${badgeText ? `
      <g transform="translate(14, 14)">
        <rect width="${badgeWidth}" height="28" rx="6" fill="rgba(0,0,0,0.82)" stroke="rgba(255,255,255,0.6)" stroke-width="1.2"/>
        <text x="${badgeWidth / 2}" y="15" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="13px" letter-spacing="0.5px">${badgeText}</text>
      </g>
    ` : ''}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createWatermarkedCanvasUrl(
  imageUrl: string,
  watermarkText = 'TexDesigner',
  density: 'compact' | 'normal' | 'dense' = 'normal',
  designId?: string
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
          return resolve(createSvgCompositeDataUrl(imageUrl, watermarkText, density, designId));
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

            // 3. Draw Design ID corner badge on canvas
            if (designId) {
              const badgeText = designId.startsWith('ID:') ? designId : `ID: ${designId}`;
              ctx.save();
              ctx.globalAlpha = 0.95;
              const badgeWidth = Math.max(90, badgeText.length * 10 + 24);
              const badgeHeight = Math.max(30, Math.round(height * 0.045));
              const margin = Math.max(14, Math.round(width * 0.02));

              ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
              ctx.lineWidth = 1.5;

              ctx.beginPath();
              if (typeof (ctx as any).roundRect === 'function') {
                (ctx as any).roundRect(margin, margin, badgeWidth, badgeHeight, 6);
              } else {
                ctx.rect(margin, margin, badgeWidth, badgeHeight);
              }
              ctx.fill();
              ctx.stroke();

              ctx.fillStyle = '#ffffff';
              ctx.font = `bold ${Math.max(13, Math.round(badgeHeight * 0.5))}px system-ui, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(badgeText, margin + badgeWidth / 2, margin + badgeHeight / 2);
              ctx.restore();
            }

            resolve(canvas.toDataURL('image/jpeg', 0.92));
          } catch {
            resolve(createSvgCompositeDataUrl(imageUrl, watermarkText, density, designId));
          }
        };
        patternImg.onerror = () => resolve(createSvgCompositeDataUrl(imageUrl, watermarkText, density, designId));
        patternImg.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      } catch {
        resolve(createSvgCompositeDataUrl(imageUrl, watermarkText, density, designId));
      }
    };

    img.onerror = () => resolve(createSvgCompositeDataUrl(imageUrl, watermarkText, density, designId));
    img.src = imageUrl;
  });
}
