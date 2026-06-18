import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { designs } from '../../data/mockData';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export function DesignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { isAuthenticated } = useAuth();
  
  const design = designs.find(d => d.id === id) || designs[0];
  const [selectedLicense, setSelectedLicense] = useState('Standard');
  const [activeTab, setActiveTab] = useState('details');

  const isWishlisted = isInWishlist(design.id);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(design, selectedLicense);
  };

  const licenseOptions = [
    { name: 'Standard', price: design.price, desc: 'Up to 500 units. Digital + Print.' },
    { name: 'Extended', price: design.price * 2.5, desc: 'Up to 5,000 units. Unlimited web.' },
    { name: 'Exclusive Buyout', price: design.price * 8, desc: 'Full IP transfer. Design removed from store.' }
  ];

  return (
    <div className="bg-surface min-h-screen pb-24">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-outline-variant">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-4 flex items-center gap-2 text-sm">
          <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <Link to="/marketplace" className="text-on-surface-variant hover:text-primary transition-colors">Marketplace</Link>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <span className="text-on-surface font-semibold">{design.category}</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-10 pt-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-surface-container border border-outline-variant group">
              <img src={design.image} alt={design.title} className="w-full h-[600px] object-cover cursor-zoom-in" />
              <button 
                onClick={() => toggleWishlist(design)}
                className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-modal z-10"
              >
                <span className={`material-symbols-outlined text-[24px] ${isWishlisted ? 'filled text-error' : 'text-on-surface-variant'}`}>favorite</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`rounded-xl overflow-hidden bg-surface-container border-2 cursor-pointer h-24 ${i === 1 ? 'border-primary' : 'border-outline-variant/30 hover:border-primary/50'}`}>
                  <img src={design.image} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="lg:col-span-5 space-y-8 lg:pl-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-primary-fixed text-primary px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">{design.category}</span>
                {design.badge && <span className="bg-secondary-container text-on-secondary px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">{design.badge}</span>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-2 leading-tight">{design.title}</h1>
              <div className="flex items-center gap-4 text-sm text-on-surface-variant mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                    {design.designerAvatar}
                  </div>
                  <span className="font-semibold text-primary hover:underline cursor-pointer">{design.designer}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-outline-variant"></div>
                <div className="flex items-center gap-1 text-secondary-container">
                  <span className="material-symbols-outlined filled text-[16px]">star</span>
                  <span className="font-bold text-on-surface">{design.rating}</span>
                  <span className="text-on-surface-variant">({design.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-outline-variant shadow-sm card-lift">
              <h3 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">gavel</span>
                Select License Type
              </h3>
              <div className="space-y-3">
                {licenseOptions.map(option => (
                  <label key={option.name} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedLicense === option.name ? 'border-primary bg-primary-fixed/10' : 'border-outline-variant/50 hover:border-outline-variant bg-white'}`}>
                    <input type="radio" name="license" value={option.name} checked={selectedLicense === option.name} onChange={() => setSelectedLicense(option.name)} className="mt-1 w-4 h-4 text-primary border-outline-variant focus:ring-primary cursor-pointer" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold ${selectedLicense === option.name ? 'text-primary' : 'text-on-surface'}`}>{option.name}</span>
                        <span className="font-bold text-primary-container">${option.price.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-outline-variant/50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-on-surface-variant">Total Payment</span>
                  <span className="text-3xl font-bold text-primary">${licenseOptions.find(l => l.name === selectedLicense)?.price.toLocaleString()}</span>
                </div>
                <button onClick={handleAddToCart} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2 group">
                  <span className="material-symbols-outlined group-hover:scale-110 transition-transform">shopping_cart</span>
                  Add to Cart
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
              <div className="flex border-b border-outline-variant">
                <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'details' ? 'text-primary border-b-2 border-primary bg-primary-fixed/5' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>Details</button>
                <button onClick={() => setActiveTab('specs')} className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'specs' ? 'text-primary border-b-2 border-primary bg-primary-fixed/5' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>Specifications</button>
              </div>
              <div className="p-6">
                {activeTab === 'details' ? (
                  <p className="text-sm text-on-surface-variant leading-relaxed">{design.description}</p>
                ) : (
                  <ul className="space-y-3 text-sm text-on-surface-variant">
                    <li className="flex gap-4 border-b border-outline-variant/30 pb-2"><span className="w-24 font-semibold text-on-surface">Fabric</span> <span>{design.fabric}</span></li>
                    <li className="flex gap-4 border-b border-outline-variant/30 pb-2"><span className="w-24 font-semibold text-on-surface">Dimensions</span> <span>{design.dimensions}</span></li>
                    <li className="flex gap-4 border-b border-outline-variant/30 pb-2"><span className="w-24 font-semibold text-on-surface">Colors</span> <span>{design.colorways.join(', ')}</span></li>
                    <li className="flex gap-4 pb-2"><span className="w-24 font-semibold text-on-surface">Tags</span> <div className="flex flex-wrap gap-2">{design.tags.map(tag => <span key={tag} className="bg-surface-container px-2 py-0.5 rounded text-xs">{tag}</span>)}</div></li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
