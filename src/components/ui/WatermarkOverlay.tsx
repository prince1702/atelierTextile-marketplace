import React from 'react';

interface WatermarkOverlayProps {
  text?: string;
  className?: string;
  density?: 'compact' | 'normal' | 'dense';
  opacity?: number;
}

export function WatermarkOverlay({ 
  text = 'TexDesigner', 
  className = '',
  density = 'normal',
  opacity = 0.55
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
          fill: rgba(255, 255, 255, 0.65);
          stroke: rgba(0, 0, 0, 0.3);
          stroke-width: 1.5px;
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
  );
}
