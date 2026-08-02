import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  title?: string;
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
  title,
}: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const lastWheelTime = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const totalImages = images.length;
  const currentImage = images[currentIndex] || images[0];

  // Reset zoom & position when photo index changes or modal opens
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex, isOpen]);

  // Navigate to previous photo
  const handlePrev = useCallback(() => {
    if (totalImages <= 1) return;
    const prevIndex = (currentIndex - 1 + totalImages) % totalImages;
    onIndexChange(prevIndex);
  }, [currentIndex, totalImages, onIndexChange]);

  // Navigate to next photo
  const handleNext = useCallback(() => {
    if (totalImages <= 1) return;
    const nextIndex = (currentIndex + 1) % totalImages;
    onIndexChange(nextIndex);
  }, [currentIndex, totalImages, onIndexChange]);

  // Handle Mouse Wheel Scroll to switch photos (or zoom if zoomed in)
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Prevent browser default scroll behavior
      e.stopPropagation();

      const now = Date.now();

      // If user is zoomed in, allow zooming via wheel or reset to scroll
      if (zoom > 1) {
        if (e.deltaY < 0) {
          setZoom((prev) => Math.min(prev + 0.25, 4));
        } else {
          const newZoom = Math.max(zoom - 0.25, 1);
          setZoom(newZoom);
          if (newZoom === 1) setPosition({ x: 0, y: 0 });
        }
        return;
      }

      // Throttle photo switching so 1 scroll tick = 1 photo move (cooldown 220ms)
      if (now - lastWheelTime.current < 220) return;

      if (e.deltaY > 0 || e.deltaX > 0) {
        lastWheelTime.current = now;
        handleNext();
      } else if (e.deltaY < 0 || e.deltaX < 0) {
        lastWheelTime.current = now;
        handlePrev();
      }
    },
    [zoom, handleNext, handlePrev]
  );

  // Handle Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        setZoom((prev) => Math.min(prev + 0.5, 4));
      } else if (e.key === '-') {
        setZoom((prev) => {
          const nextZ = Math.max(prev - 0.5, 1);
          if (nextZ === 1) setPosition({ x: 0, y: 0 });
          return nextZ;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock background scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1 && zoom === 1) {
      const diffX = e.changedTouches[0].clientX - touchStartX.current;
      const diffY = e.changedTouches[0].clientY - touchStartY.current;

      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
  };

  // Drag handlers for panned/zoomed photo
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      e.preventDefault();
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

  // Toggle Zoom on Double Click
  const handleDoubleClick = () => {
    if (zoom > 1) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoom(2.5);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-fade-in"
      onWheel={handleWheel}
      onClick={onClose}
    >
      {/* Top Header Controls */}
      <div
        className="w-full px-6 py-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 text-white">
          {title && (
            <span className="font-bold text-lg hidden sm:inline max-w-xs truncate text-gray-200">
              {title}
            </span>
          )}
          <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold tracking-wider">
            {currentIndex + 1} / {totalImages}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center bg-white/10 backdrop-blur rounded-lg p-1 text-white border border-white/10">
            <button
              onClick={() => {
                const nextZ = Math.max(zoom - 0.5, 1);
                setZoom(nextZ);
                if (nextZ === 1) setPosition({ x: 0, y: 0 });
              }}
              title="Zoom Out (-)"
              disabled={zoom <= 1}
              className="p-1.5 hover:bg-white/20 rounded disabled:opacity-40 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">zoom_out</span>
            </button>
            <span className="px-2 text-xs font-mono font-medium min-w-[45px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((prev) => Math.min(prev + 0.5, 4))}
              title="Zoom In (+)"
              disabled={zoom >= 4}
              className="p-1.5 hover:bg-white/20 rounded disabled:opacity-40 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">zoom_in</span>
            </button>
            {zoom > 1 && (
              <button
                onClick={() => {
                  setZoom(1);
                  setPosition({ x: 0, y: 0 });
                }}
                title="Reset Zoom"
                className="p-1.5 hover:bg-white/20 rounded transition-colors text-xs font-bold px-2"
              >
                Reset
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10"
            title="Close (Esc)"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
      </div>

      {/* Main Photo Viewing Area */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden px-4 md:px-16"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Previous Button */}
        {totalImages > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 md:left-8 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/50 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg"
            title="Previous Photo (Scroll Up / Left Arrow)"
          >
            <span className="material-symbols-outlined text-[32px]">chevron_left</span>
          </button>
        )}

        {/* Photo Container */}
        <div
          className="relative flex items-center justify-center max-w-full max-h-full transition-transform duration-100 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentImage}
            alt={title || `Photo ${currentIndex + 1}`}
            onDoubleClick={handleDoubleClick}
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            }}
            className="max-h-[75vh] max-w-[88vw] object-contain rounded-lg shadow-2xl transition-all duration-150 select-none"
          />
        </div>

        {/* Next Button */}
        {totalImages > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 md:right-8 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/50 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg"
            title="Next Photo (Scroll Down / Right Arrow)"
          >
            <span className="material-symbols-outlined text-[32px]">chevron_right</span>
          </button>
        )}
      </div>

      {/* Helper Notification Banner */}
      <div className="w-full text-center py-1.5 text-xs text-white/70 bg-black/40 backdrop-blur z-10 pointer-events-none">
        <span className="inline-flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">mouse</span>
          Scroll mouse wheel, swipe, or use arrow keys to switch photos
        </span>
      </div>

      {/* Bottom Thumbnail Strip */}
      {totalImages > 1 && (
        <div
          className="w-full p-4 bg-gradient-to-t from-black/90 to-transparent z-20 flex justify-center overflow-x-auto gap-3 scrollbar-none"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onIndexChange(idx)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                currentIndex === idx
                  ? 'border-primary ring-2 ring-primary/50 scale-105 opacity-100'
                  : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
              }`}
            >
              <img
                src={imgUrl}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
