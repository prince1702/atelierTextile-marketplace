import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const { items } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-outline-variant transition-all duration-300">
      <div className="flex justify-between items-center px-6 md:px-10 h-16 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-[28px]">texture</span>
            <span className="font-bold text-xl tracking-tight">AtelierTextile</span>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link to="/" className={`text-sm font-medium py-4 relative group ${(isActive('/') || isActive('/marketplace')) ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
              Marketplace
              <div className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-200 ${(isActive('/') || isActive('/marketplace')) ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex relative mr-2">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input 
              className="pl-9 pr-4 py-2 rounded-full border border-outline-variant bg-surface-container-lowest focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 focus:outline-none transition-all text-sm w-56 input-glow" 
              placeholder="Search patterns..." 
              type="text"
            />
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {user?.role === 'customer' && (
                <Link to="/customer/wishlist" className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors relative">
                  <span className="material-symbols-outlined">favorite</span>
                </Link>
              )}
              
              <Link to="/cart" className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors relative">
                <span className="material-symbols-outlined">shopping_cart</span>
                {items.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                    {items.length}
                  </span>
                )}
              </Link>
              
              <Link to={`/${user?.role}/dashboard`} className="flex items-center gap-2 pl-2 border-l border-outline-variant">
                <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {user?.initials}
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden md:block text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors px-3 py-2">
                Login
              </Link>
              <Link to="/register" className="bg-primary-container text-on-primary text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary transition-colors shadow-sm card-lift">
                Get Started
              </Link>
            </div>
          )}
          
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-on-surface p-2 rounded-lg hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Content */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-outline-variant absolute top-16 left-0 w-full shadow-lg p-4 flex flex-col gap-4">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`text-sm font-medium ${(isActive('/') || isActive('/marketplace')) ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>Marketplace</Link>
          {/* No additional links */}
          
          {!isAuthenticated && (
            <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-outline-variant">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-center py-2 text-on-surface border border-outline-variant rounded-lg">Login</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="bg-primary-container text-on-primary text-sm font-semibold text-center py-2 rounded-lg">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
