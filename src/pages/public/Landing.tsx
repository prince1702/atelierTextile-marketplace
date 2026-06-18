import React from 'react';
import { Link } from 'react-router-dom';
import { designs } from '../../data/mockData';
import { DesignCard } from '../../components/ui/DesignCard';

export function Landing() {
  const featuredDesigns = designs.slice(0, 4);

  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary-container opacity-5 rounded-full blur-3xl mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary-container opacity-5 rounded-full blur-3xl mix-blend-multiply"></div>
          <div className="absolute top-[30%] left-[20%] w-64 h-64 bg-primary rounded-full blur-3xl opacity-5 mix-blend-multiply"></div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-10 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-primary font-semibold text-xs mb-6 border border-primary-fixed-dim uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">stars</span>
              B2B Premium Marketplace
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-on-surface leading-[1.1] mb-6 tracking-tight">
              Weave Your <br />
              <span className="gradient-text">Success.</span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant mb-10 leading-relaxed font-light">
              Connect with top artisan studios globally. Source, license, and procure high-fidelity textile patterns for your next fashion line or interior project.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/marketplace" className="px-8 py-4 bg-primary text-on-primary rounded-xl font-semibold text-lg hover:bg-primary-container transition-colors duration-300 shadow-card hover:shadow-card-hover flex items-center gap-2 group card-lift">
                Explore Patterns
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <Link to="/register" className="px-8 py-4 bg-white border border-outline-variant text-on-surface rounded-xl font-semibold text-lg hover:bg-surface-container transition-colors duration-300 shadow-sm flex items-center gap-2 group">
                <span className="material-symbols-outlined">storefront</span>
                Become a Seller
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`w-12 h-12 rounded-full border-2 border-background flex items-center justify-center text-white font-bold shadow-sm ${i%2===0?'bg-primary':'bg-secondary-container'}`}>
                    U{i}
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-secondary-container">
                  {[1,2,3,4,5].map(i => <span key={i} className="material-symbols-outlined filled text-[18px]">star</span>)}
                </div>
                <span className="text-sm font-semibold text-on-surface-variant">Trusted by 2,000+ brands</span>
              </div>
            </div>
          </div>

          <div className="relative h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl animate-fade-in group">
            <img 
              src={designs[1].image} 
              alt="Premium Textile Display" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>
            
            <div className="absolute bottom-8 left-8 right-8 glass rounded-xl p-6 border border-white/20 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex justify-between items-center mb-2">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">Featured Design</span>
                <span className="text-white font-bold text-xl">$1,250</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Indigo Amber Flow</h3>
              <p className="text-white/80 text-sm">By Atelier Rousseau</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Patterns Section */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Curated Collection</h2>
              <p className="text-lg text-on-surface-variant">Discover our hand-picked selection of premium textile patterns trending this season.</p>
            </div>
            <Link to="/marketplace" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-container transition-colors">
              View All Patterns <span className="material-symbols-outlined">trending_flat</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDesigns.map(design => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust/Features Section */}
      <section id="features" className="py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-container rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-on-primary">Why Choose AtelierTextile?</h2>
            <p className="text-lg text-primary-fixed-dim">We provide an end-to-end solution for sourcing and managing premium textile intellectual property.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-primary-container/40 p-8 rounded-2xl border border-primary-container backdrop-blur-sm card-lift">
              <div className="w-14 h-14 bg-primary-fixed text-primary rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[28px]">verified</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-on-primary">Verified Studios</h3>
              <p className="text-primary-fixed-dim leading-relaxed">Every designer on our platform passes a strict vetting process to ensure exceptional quality and commercial readiness.</p>
            </div>
            <div className="bg-primary-container/40 p-8 rounded-2xl border border-primary-container backdrop-blur-sm card-lift">
              <div className="w-14 h-14 bg-secondary-fixed text-secondary-container rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[28px]">gavel</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-on-primary">Clear Licensing</h3>
              <p className="text-primary-fixed-dim leading-relaxed">Transparent digital contracts for Standard, Exclusive, or Global buyouts. No legal ambiguity.</p>
            </div>
            <div className="bg-primary-container/40 p-8 rounded-2xl border border-primary-container backdrop-blur-sm card-lift">
              <div className="w-14 h-14 bg-tertiary-fixed text-tertiary-container rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[28px]">speed</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-on-primary">Instant Delivery</h3>
              <p className="text-primary-fixed-dim leading-relaxed">Receive high-resolution, production-ready files (TIFF, AI, PSD) immediately upon license completion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-surface-container-low text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-primary mb-6">Ready to elevate your collection?</h2>
          <p className="text-xl text-on-surface-variant mb-10">Join thousands of brands sourcing the world's finest textile designs.</p>
          <Link to="/register" className="inline-flex px-10 py-4 bg-secondary-container text-on-secondary rounded-xl font-bold text-lg hover:bg-secondary transition-colors duration-300 shadow-card card-lift">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
