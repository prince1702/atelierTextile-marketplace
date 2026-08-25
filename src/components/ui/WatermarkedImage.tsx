import React, { useState, useEffect } from 'react';
import { WatermarkOverlay } from './WatermarkOverlay';
import { createWatermarkedCanvasUrl } from '../../utils/watermark';

interface WatermarkedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  watermarkText?: string;
  density?: 'compact' | 'normal' | 'dense';
  showWatermark?: boolean;
}

export function WatermarkedImage({
  containerClassName = '',
  watermarkText = 'TexDesigner',
  density = 'normal',
  showWatermark = true,
  className = '',
  alt = '',
  src = '',
  ...props
}: WatermarkedImageProps) {
  const [bakedSrc, setBakedSrc] = useState<string>(src);

  useEffect(() => {
    if (!src || !showWatermark) {
      setBakedSrc(src);
      return;
    }

    let isMounted = true;
    createWatermarkedCanvasUrl(src, watermarkText, density).then((res) => {
      if (isMounted) setBakedSrc(res);
    });

    return () => {
      isMounted = false;
    };
  }, [src, watermarkText, density, showWatermark]);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <img
        src={bakedSrc || src}
        className={className}
        alt={alt}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        {...props}
      />
      {showWatermark && <WatermarkOverlay text={watermarkText} density={density} />}
    </div>
  );
}
