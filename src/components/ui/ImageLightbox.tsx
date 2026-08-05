import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (index: number) => void;
  onIndexChange?: (index: number) => void;
  title?: string;
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onSelectImage,
  onIndexChange,
  title = 'Design Image View',
}: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isWheelLockedRef = useRef(false);

  const safeIndex = Math.max(0, Math.min(currentIndex, images.length - 1));
  const currentImage = images[safeIndex] || images[0];

  const changeIndex = useCallback(
    (newIdx: number) => {
      if (onSelectImage) onSelectImage(newIdx);
      if (onIndexChange) onIndexChange(newIdx);
    },
    [onSelectImage, onIndexChange]
  );

  // Reset zoom & pan when image changes or modal opens
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex, isOpen]);

  const handleNext = useCallback(() => {
    if (images.length === 0) return;
    const nextIndex = (safeIndex + 1) % images.length;
    changeIndex(nextIndex);
  }, [safeIndex, images.length, changeIndex]);

  const handlePrev = useCallback(() => {
    if (images.length === 0) return;
    const prevIndex = (safeIndex - 1 + images.length) % images.length;
    changeIndex(prevIndex);
  }, [safeIndex, images.length, changeIndex]);

  // Handle Wheel Scroll for Image Navigation
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (zoom > 1.05) {
        setZoom((prev) => Math.max(1, Math.min(4, prev - e.deltaY * 0.002)));
        return;
      }

      if (isWheelLockedRef.current) return;

      if (e.deltaY > 20 || e.deltaX > 20) {
        isWheelLockedRef.current = true;
        handleNext();
      } else if (e.deltaY < -20 || e.deltaX < -20) {
        isWheelLockedRef.current = true;
        handlePrev();
      }

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        isWheelLockedRef.current = false;
      }, 350);
    },
    [zoom, handleNext, handlePrev]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Touch Swipe Handler
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStart(null);
  };

  // Mouse Drag / Pan when Zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleToggleZoom = () => {
    if (zoom > 1) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoom(2.2);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-fade-in"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseUp={handleMouseUp}
    >
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent text-white z-20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[28px]">collections</span>
          <div>
            <h3 className="font-bold text-sm sm:text-base line-clamp-1">{title}</h3>
            <p className="text-xs text-white/70">
              Image <span className="text-white font-semibold">{safeIndex + 1}</span> of{' '}
              <span className="text-white font-semibold">{images.length}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <button
            onClick={() => setZoom((prev) => Math.min(4, prev + 0.5))}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[20px]">zoom_in</span>
          </button>
          <button
            onClick={() => {
              if (zoom <= 1.2) {
                setZoom(1);
                setPosition({ x: 0, y: 0 });
              } else {
                setZoom((prev) => Math.max(1, prev - 0.5));
              }
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[20px]">zoom_out</span>
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white text-xs font-semibold px-2"
            title="Reset Zoom"
          >
            1:1
          </button>

          <div className="h-6 w-px bg-white/20 mx-1"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-white/15 hover:bg-red-600 flex items-center justify-center transition-colors text-white"
            title="Close (Esc)"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden p-4 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Navigation Button Left */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/50 hover:bg-primary border border-white/20 text-white flex items-center justify-center transition-all duration-200 shadow-xl backdrop-blur group"
            title="Previous Image (Scroll Up / Left Arrow)"
          >
            <span className="material-symbols-outlined text-[32px] group-hover:-translate-x-0.5 transition-transform">
              chevron_left
            </span>
          </button>
        )}

        {/* Display Image */}
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          <img
            src={currentImage}
            alt={`${title} - view ${safeIndex + 1}`}
            onDoubleClick={handleToggleZoom}
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.25s ease-out',
            }}
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl cursor-pointer"
          />
        </div>

        {/* Navigation Button Right */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/50 hover:bg-primary border border-white/20 text-white flex items-center justify-center transition-all duration-200 shadow-xl backdrop-blur group"
            title="Next Image (Scroll Down / Right Arrow)"
          >
            <span className="material-symbols-outlined text-[32px] group-hover:translate-x-0.5 transition-transform">
              chevron_right
            </span>
          </button>
        )}

        {/* Scroll Helper Hint Pill */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white/80 text-xs flex items-center gap-2 pointer-events-none shadow-lg animate-pulse">
          <span className="material-symbols-outlined text-[16px] text-primary">mouse</span>
          <span>Scroll mouse wheel or swipe to switch images</span>
        </div>
      </div>

      {/* Bottom Thumbnail Carousel Strip */}
      {images.length > 1 && (
        <div className="px-6 py-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent flex justify-center z-20">
          <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-1 scrollbar-thin scrollbar-thumb-white/20">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => changeIndex(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 ${
                  idx === safeIndex
                    ? 'border-primary ring-4 ring-primary/40 scale-105 opacity-100'
                    : 'border-white/20 hover:border-white/60 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
