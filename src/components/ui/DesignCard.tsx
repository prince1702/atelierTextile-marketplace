import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Design } from '../../types';
import { useCart } from '../../contexts/CartContext';

import { WatermarkedImage } from './WatermarkedImage';

interface DesignCardProps {
  design: Design;
}

export function DesignCard({ design }: DesignCardProps) {
  const { toggleWishlist, isInWishlist } = useCart();
  const navigate = useNavigate();
  const isWishlisted = isInWishlist(design.id);

  const getBadgeColor = (color?: string) => {
    switch (color) {
      case 'amber': return 'bg-secondary-container text-on-secondary';
      case 'blue': return 'bg-primary-fixed text-primary';
      case 'green': return 'bg-tertiary-fixed text-on-tertiary-fixed';
      case 'orange': return 'bg-secondary-fixed text-secondary';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-outline-variant overflow-hidden card-lift group flex flex-col h-full">
      <Link to={`/design/${design.id}`} className="relative h-40 sm:h-56 overflow-hidden bg-surface-container block">
        <WatermarkedImage 
          src={design.image} 
          alt={design.title} 
          density="compact"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {design.badge && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className={`${getBadgeColor(design.badgeColor)} text-[9px] sm:text-[11px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider`}>
              {design.badge}
            </span>
          </div>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleWishlist(design);
          }}
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white text-on-surface-variant transition-colors shadow-sm"
        >
          <span className={`material-symbols-outlined text-[16px] sm:text-[18px] ${isWishlisted ? 'filled text-error' : ''}`}>
            favorite
          </span>
        </button>
      </Link>
      
      <div className="p-3 sm:p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-1 mb-1">
          <Link to={`/design/${design.id}`} className="font-semibold text-on-surface text-sm sm:text-base hover:text-primary transition-colors line-clamp-1">
            {design.title}
          </Link>
          <div className="flex items-center gap-0.5 bg-surface-container px-1 py-0.5 rounded text-[10px] sm:text-xs font-semibold text-on-surface-variant shrink-0">
            <span className="material-symbols-outlined text-[12px] sm:text-[14px] text-secondary-container filled">star</span>
            {design.rating}
          </div>
        </div>
        
        <p className="text-[11px] sm:text-xs text-on-surface-variant mb-3 sm:mb-4 flex items-center gap-1">
          <span>by <span className="font-medium text-on-surface">{design.designerName}</span></span>
        </p>
 
        <div className="mt-auto pt-3 sm:pt-4 border-t border-outline-variant flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between w-full">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-outline tracking-wider">License from</span>
            <span className="text-base sm:text-lg font-bold text-primary-container">₹{design.price}</span>
          </div>
          <Link 
            to={`/design/${design.id}`} 
            className="bg-primary text-on-primary text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm text-center w-full sm:w-auto"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
