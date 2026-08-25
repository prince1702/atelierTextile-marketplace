import React from 'react';

interface WatermarkOverlayProps {
  text?: string;
  designId?: string;
  className?: string;
  density?: 'compact' | 'normal' | 'dense';
  opacity?: number;
}

export function WatermarkOverlay({ 
  text = 'TexDesigner', 
  designId,
  className = '',
  density = 'normal',
  opacity = 0.70
}: WatermarkOverlayProps) {
  const displayUrl = React.useMemo(() => {
    const displayText = text.toUpperCase();
    // Decreased density by 50% via larger tile spacing
    const tileSize = density === 'compact' ? 260 : density === 'dense' ? 220 : 240;
    const fontSize = density === 'compact' ? 14 : density === 'dense' ? 15 : 16;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize}" height="${tileSize}" viewBox="0 0 ${tileSize} ${tileSize}">
      <style>
        .wm-text {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-weight: 800;
          font-size: ${fontSize}px;
          letter-spacing: 2.5px;
          fill: rgba(255, 255, 255, 0.85);
          stroke: rgba(0, 0, 0, 0.55);
          stroke-width: 1.8px;
          paint-order: stroke fill;
          stroke-linejoin: round;
        }
      </style>
      <g transform="rotate(-30 ${tileSize / 2} ${tileSize / 2})">
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" class="wm-text">${displayText}</text>
      </g>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [text, density]);

  return (
    <>
      <div 
        aria-hidden="true" 
        className={`absolute inset-0 pointer-events-none select-none z-20 overflow-hidden ${className}`}
        style={{
          backgroundImage: `url("${displayUrl}")`,
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center center',
          opacity: opacity,
        }}
      />
      {designId && (
        <div className="absolute top-3 left-3 z-30 pointer-events-none select-none">
          <span className="bg-black/80 backdrop-blur text-white text-[11px] font-extrabold px-2.5 py-1 rounded border border-white/30 shadow-md tracking-wider uppercase">
            {designId.startsWith('ID:') ? designId : `ID: ${designId}`}
          </span>
        </div>
      )}
    </>
  );
}
