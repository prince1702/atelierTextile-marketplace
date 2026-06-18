import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Design } from '../../data/mockData';
import { useCart } from '../../contexts/CartContext';

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
      <div className="relative h-56 overflow-hidden bg-surface-container cursor-pointer" onClick={() => navigate(`/design/${design.id}`)}>
        <img 
          src={design.image} 
          alt={design.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {design.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className={`${getBadgeColor(design.badgeColor)} text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider`}>
              {design.badge}
            </span>
          </div>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(design);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white text-on-surface-variant transition-colors shadow-sm"
        >
          <span className={`material-symbols-outlined text-[18px] ${isWishlisted ? 'filled text-error' : ''}`}>
            favorite
          </span>
        </button>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <Link to={`/design/${design.id}`} className="font-semibold text-on-surface text-base hover:text-primary transition-colors line-clamp-1">
            {design.title}
          </Link>
          <div className="flex items-center gap-1 bg-surface-container px-1.5 py-0.5 rounded text-xs font-semibold text-on-surface-variant shrink-0">
            <span className="material-symbols-outlined text-[14px] text-secondary-container filled">star</span>
            {design.rating}
          </div>
        </div>
        
        <p className="text-xs text-on-surface-variant mb-4 flex items-center gap-1">
          <span>by <span className="font-medium text-on-surface">{design.designer}</span></span>
          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
          <span>{design.fabric}</span>
        </p>

        <div className="mt-auto pt-4 border-t border-outline-variant flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-outline tracking-wider">License from</span>
            <span className="text-lg font-bold text-primary-container">${design.price}</span>
          </div>
          <Link 
            to={`/design/${design.id}`} 
            className="bg-primary text-on-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
