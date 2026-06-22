import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { DesignCard } from '../../components/ui/DesignCard';
import { Link } from 'react-router-dom';

export function WishlistPage() {
  const { wishlist } = useCart();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-1">My Wishlist</h2>
        <p className="text-sm text-on-surface-variant">Your collection of saved textile designs and patterns.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-outline">
            <span className="material-symbols-outlined text-[32px] text-error">favorite</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-2">No saved designs</h3>
          <p className="text-on-surface-variant mb-6">Explore the marketplace and tap the heart icon on any design to save it here.</p>
          <Link 
            to="/marketplace"
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-container transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">explore</span>
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map(design => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      )}
    </div>
  );
}
