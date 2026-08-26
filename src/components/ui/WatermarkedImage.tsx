import React, { useState } from 'react';
import { WatermarkOverlay } from './WatermarkOverlay';

interface WatermarkedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  watermarkText?: string;
  designId?: string;
  density?: 'compact' | 'normal' | 'dense';
  showWatermark?: boolean;
}

export function WatermarkedImage({
  containerClassName = '',
  watermarkText = 'TexDesigner',
  designId,
  density = 'normal',
  showWatermark = true,
  className = '',
  alt = '',
  src = '',
  ...props
}: WatermarkedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  return (
    <div 
      className={`relative overflow-hidden select-none bg-surface-container ${containerClassName}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Loading Skeleton */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse z-0" />
      )}

      <img
        src={src}
        className={`select-none transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setIsLoaded(true);
          setIsError(true);
        }}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        {...props}
      />
      {showWatermark && <WatermarkOverlay text={watermarkText} designId={designId} density={density} />}
    </div>
  );
}
