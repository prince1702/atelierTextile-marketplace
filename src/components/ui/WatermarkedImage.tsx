import React, { useState, useEffect } from 'react';
import { WatermarkOverlay } from './WatermarkOverlay';
import { createWatermarkedCanvasUrl, createSvgCompositeDataUrl } from '../../utils/watermark';

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
  // Synchronously initialize to SVG composite Data URL so raw URL is NEVER exposed
  const [bakedSrc, setBakedSrc] = useState<string>(() => {
    if (!src || !showWatermark) return src;
    return createSvgCompositeDataUrl(src, watermarkText, density, designId);
  });

  useEffect(() => {
    if (!src || !showWatermark) {
      setBakedSrc(src);
      return;
    }

    // Set synchronous composite URL immediately
    setBakedSrc(createSvgCompositeDataUrl(src, watermarkText, density, designId));

    let isMounted = true;
    createWatermarkedCanvasUrl(src, watermarkText, density, designId).then((res) => {
      if (isMounted && res) setBakedSrc(res);
    });

    return () => {
      isMounted = false;
    };
  }, [src, watermarkText, density, showWatermark, designId]);

  return (
    <div 
      className={`relative overflow-hidden select-none ${containerClassName}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img
        src={bakedSrc}
        className={`select-none ${className}`}
        alt={alt}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        {...props}
      />
      {showWatermark && <WatermarkOverlay text={watermarkText} designId={designId} density={density} />}
    </div>
  );
}
