import React from 'react';

interface WatermarkOverlayProps {
  text?: string;
  className?: string;
  density?: 'compact' | 'normal' | 'dense';
}

export function WatermarkOverlay({ 
  text = 'TexDesigner', 
  className = '',
  density = 'normal'
}: WatermarkOverlayProps) {
  const rows = density === 'compact' ? [0, 1] : density === 'dense' ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3];

  return (
    <div 
      aria-hidden="true" 
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-10 flex flex-col justify-around py-2 ${className}`}
    >
      {rows.map((row) => (
        <div 
          key={row} 
          className="flex justify-around items-center whitespace-nowrap transform -rotate-[25deg] scale-125 opacity-35"
        >
          {[0, 1, 2, 3].map((col) => (
            <span 
              key={col} 
              className="text-white text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-widest px-4 py-1 border-y border-white/20 bg-black/15 backdrop-blur-[1px] rounded"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.95)' }}
            >
              {text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
