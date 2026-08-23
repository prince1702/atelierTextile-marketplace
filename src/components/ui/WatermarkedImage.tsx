import React from 'react';
import { WatermarkOverlay } from './WatermarkOverlay';

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
  ...props
}: WatermarkedImageProps) {
  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <img className={className} alt={alt} {...props} />
      {showWatermark && <WatermarkOverlay text={watermarkText} density={density} />}
    </div>
  );
}
