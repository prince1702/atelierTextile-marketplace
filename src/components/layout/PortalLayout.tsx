import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

// Navigation configuration for different roles
const navConfig = {
  admin: [
    { name: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
    { name: 'Inventory', icon: 'inventory_2', path: '/admin/inventory' },
    { name: 'Users', icon: 'group', path: '/admin/users' },
    { name: 'Analytics', icon: 'analytics', path: '/admin/analytics' },
    { name: 'Settings', icon: 'settings', path: '/profile' }
  ],
  seller: [
    { name: 'Dashboard', icon: 'dashboard', path: '/seller/dashboard' },
    { name: 'My Designs', icon: 'palette', path: '/seller/designs' },
    { name: 'Upload', icon: 'upload', path: '/seller/upload' },
    { name: 'Sales', icon: 'payments', path: '/seller/sales' },
    { name: 'Settings', icon: 'settings', path: '/profile' }
  ],
  customer: [
    { name: 'Dashboard', icon: 'dashboard', path: '/customer/dashboard' },
    { name: 'Wishlist', icon: 'favorite', path: '/customer/wishlist' },
    { name: 'My Orders', icon: 'shopping_cart', path: '/customer/orders' },
    { name: 'Rewards', icon: 'stars', path: '/customer/rewards' },
    { name: 'Support', icon: 'support_agent', path: '/customer/support' },
    { name: 'Settings', icon: 'settings', path: '/profile' }
  ]
};

interface PortalLayoutProps {
  children: React.ReactNode;
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showToast } = useNotification();

  // If no user is logged in, this shouldn't render (protected route), but handle gracefully just in case
  if (!user) return null;

  const role = user.role;
  const navItems = navConfig[role as keyof typeof navConfig] || [];
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-surface-container-low overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[280px] bg-white border-r border-outline-variant h-full z-20">
        <div className="p-6 mb-2 border-b border-outline-variant flex items-center gap-3">
          <Link to="/" className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-container text-white">
            <span className="material-symbols-outlined">texture</span>
          </Link>
          <div>
            <h2 className="font-bold text-primary leading-tight">AtelierTextile</h2>
            <p className="text-xs text-on-surface-variant font-medium capitalize">{role} Portal</p>
          </div>
        </div>
        
        {role === 'seller' && (
          <div className="px-6 mb-4 mt-4">
            <Link to="/seller/upload" className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-container text-white rounded-lg hover:bg-primary transition-colors font-semibold text-sm shadow-sm">
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Design
            </Link>
          </div>
        )}

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link 
              key={item.name} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive(item.path) 
                  ? 'sidebar-active' 
                  : 'text-on-surface-variant hover:bg-surface-container font-semibold'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive(item.path) ? 'filled' : ''}`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-outline-variant space-y-1">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold text-error hover:bg-error-container/30 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-white shadow-xl z-50 transform transition-transform duration-300 md:hidden flex flex-col ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center">
              <span className="material-symbols-outlined">texture</span>
            </div>
            <div>
              <h2 className="font-bold text-primary leading-tight">AtelierTextile</h2>
              <p className="text-xs text-on-surface-variant font-medium capitalize">{role} Portal</p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link 
              key={item.name} 
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive(item.path) 
                  ? 'sidebar-active' 
                  : 'text-on-surface-variant hover:bg-surface-container font-semibold'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive(item.path) ? 'filled' : ''}`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-outline-variant">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold text-error hover:bg-error-container/30 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur border-b border-outline-variant sticky top-0 z-10 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            
            {/* Page Title derived from route */}
            <h1 className="text-lg font-bold text-primary capitalize hidden sm:block">
              {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:block relative mr-2">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input 
                className="pl-9 pr-4 py-1.5 rounded-full border border-outline-variant bg-surface-container-lowest focus:border-primary-container focus:outline-none transition-all text-sm w-48 input-glow" 
                placeholder="Search..." 
                type="text"
              />
            </div>
            
            <button className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors relative group">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-white"></span>
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-modal border border-outline-variant p-4 w-64 hidden group-focus:block z-50">
                <p className="text-sm font-bold text-on-surface mb-2">Notifications</p>
                <div className="text-xs text-on-surface-variant text-center py-4">No new notifications</div>
              </div>
            </button>
            
            <Link to="/profile" className="flex items-center gap-2 pl-3 ml-1 border-l border-outline-variant hover:opacity-80 transition-opacity">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-on-surface leading-tight">{user.name}</p>
                <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">{role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                {user.initials}
              </div>
            </Link>
          </div>
        </header>
        
        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="max-w-[1440px] mx-auto w-full">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}
