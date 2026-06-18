import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full py-12 border-t border-outline-variant bg-surface px-6 md:px-10 mt-auto">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-primary mb-4">
              <span className="material-symbols-outlined text-[24px]">texture</span>
              <span className="font-bold text-lg">AtelierTextile</span>
            </div>
            <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
              The premier destination for high-end textile design. Connecting artisans with enterprises globally.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-on-surface mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/marketplace" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Marketplace</Link></li>
              <li><Link to="/#designers" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Designers</Link></li>
              <li><Link to="/#pricing" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-on-surface mb-4">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Register</Link></li>
              <li><Link to="/customer/support" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-outline-variant pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-on-surface-variant">© 2024 Atelier Textile Marketplace. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
