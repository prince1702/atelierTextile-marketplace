import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Design } from '../../types';
import { DesignCard } from '../../components/ui/DesignCard';
import { useNotification } from '../../contexts/NotificationContext';

const CATEGORIES = ['All', 'Weaving Design', 'Embroidery Design', 'Digital Print Design', 'Position Print Design'];
const FABRICS = ['All', 'Cotton Blend', 'Silk', 'Linen', 'Polyester Blend', 'Wool Blend', 'Cotton Sateen'];
const PRICE_RANGES = ['All', 'Under $500', '$500 - $800', '$800 - $1000', 'Over $1000'];
const WEAVING_SUBCATEGORIES_WITH_IMAGES = [
  {
    name: 'All',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop',
  },
  {
    name: 'Kotalichi Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
  },
  {
    name: '50 600 Design',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: 'Nylon Design',
    image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=200&h=200&fit=crop',
  },
  {
    name: 'Satin Design',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
  },
  {
    name: 'Cotton Design',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
  },
  {
    name: 'All Over Design',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=200&h=200&fit=crop',
  },
  {
    name: 'Suit Design',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop',
  },
  {
    name: 'Dupatta Design',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: 'Blouse Design',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop',
  },
  {
    name: 'Lehengha Design',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
  },
  {
    name: 'Lace Design',
    image: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=200&h=200&fit=crop',
  }
];

const EMBROIDERY_SUBCATEGORIES_WITH_IMAGES = [
  {
    name: 'All',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: 'Multi Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
  },
  {
    name: 'Sequin Design',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: 'Cording Design',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop',
  },
  {
    name: 'Chain Design',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
  },
  {
    name: 'Beads Design',
    image: 'https://images.unsplash.com/photo-1605722243979-fe0be8158232?w=200&h=200&fit=crop',
  },
  {
    name: 'Folder Design',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: 'LTC Design',
    image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=200&h=200&fit=crop',
  },
  {
    name: 'Free Download',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=200&h=200&fit=crop',
  }
];

const ALL_SUBCATEGORIES_WITH_IMAGES = [
  {
    name: 'Kotalichi Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
    parentCategory: 'Weaving Design'
  },
  {
    name: '50 600 Design',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
    parentCategory: 'Weaving Design'
  },
  {
    name: 'Nylon Design',
    image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=200&h=200&fit=crop',
    parentCategory: 'Weaving Design'
  },
  {
    name: 'Satin Design',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
    parentCategory: 'Weaving Design'
  },
  {
    name: 'Cotton Design',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
    parentCategory: 'Weaving Design'
  },
  {
    name: 'All Over Design',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=200&h=200&fit=crop',
    parentCategory: 'Weaving Design'
  },
  {
    name: 'Suit Design',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop',
    parentCategory: 'Weaving Design'
  },
  {
    name: 'Dupatta Design',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
    parentCategory: 'Weaving Design'
  },
  {
    name: 'Blouse Design',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop',
    parentCategory: 'Weaving Design'
  },
  {
    name: 'Lehengha Design',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
    parentCategory: 'Weaving Design'
  },
  {
    name: 'Lace Design',
    image: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=200&h=200&fit=crop',
    parentCategory: 'Weaving Design'
  },
  {
    name: 'Multi Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
    parentCategory: 'Embroidery Design'
  },
  {
    name: 'Sequin Design',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
    parentCategory: 'Embroidery Design'
  },
  {
    name: 'Cording Design',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop',
    parentCategory: 'Embroidery Design'
  },
  {
    name: 'Chain Design',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
    parentCategory: 'Embroidery Design'
  },
  {
    name: 'Beads Design',
    image: 'https://images.unsplash.com/photo-1605722243979-fe0be8158232?w=200&h=200&fit=crop',
    parentCategory: 'Embroidery Design'
  },
  {
    name: 'Folder Design',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
    parentCategory: 'Embroidery Design'
  },
  {
    name: 'LTC Design',
    image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=200&h=200&fit=crop',
    parentCategory: 'Embroidery Design'
  },
  {
    name: 'Free Download',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=200&h=200&fit=crop',
    parentCategory: 'Embroidery Design'
  }
];

export function Marketplace() {
  const { showToast } = useNotification();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [sortOption, setSortOption] = useState('Newest Arrivals');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Map sort labels to backend values
  const getBackendSort = (label: string) => {
    switch (label) {
      case 'Newest Arrivals': return 'newest';
      case 'Price: Low to High': return 'price_asc';
      case 'Price: High to Low': return 'price_desc';
      case 'Recommended':
      default: return 'rating';
    }
  };

  // Map price labels to min/max
  const getPriceBounds = (label: string) => {
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (label === 'Under $500') {
      maxPrice = 499;
    } else if (label === '$500 - $800') {
      minPrice = 500;
      maxPrice = 800;
    } else if (label === '$800 - $1000') {
      minPrice = 801;
      maxPrice = 1000;
    } else if (label === 'Over $1000') {
      minPrice = 1001;
    }

    return { minPrice, maxPrice };
  };

  const fetchDesigns = async () => {
    setIsLoading(true);
    try {
      const { minPrice, maxPrice } = getPriceBounds(selectedPriceRange);
      const params: any = {
        page: currentPage,
        limit: 9,
        sort: getBackendSort(sortOption),
      };

      if (activeCategory !== 'All') params.category = activeCategory;
      if ((activeCategory === 'Weaving Design' || activeCategory === 'Embroidery Design') && activeSubcategory !== 'All') {
        params.subcategory = activeSubcategory;
      }
      if (selectedFabric !== 'All') params.fabric = selectedFabric;
      if (searchTrigger.trim()) params.search = searchTrigger;
      if (minPrice !== undefined) params.minPrice = minPrice;
      if (maxPrice !== undefined) params.maxPrice = maxPrice;

      const response = await api.designs.getAll(params);
      setDesigns(response.designs);
      setTotalPages(response.pages);
      setTotalResults(response.total);
    } catch (error) {
      console.error('Failed to fetch designs:', error);
      showToast('Error loading marketplace designs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, [activeCategory, activeSubcategory, selectedFabric, selectedPriceRange, sortOption, currentPage, searchTrigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTrigger(searchQuery);
  };

  const handleClearAll = () => {
    setActiveCategory('All');
    setActiveSubcategory('All');
    setSelectedFabric('All');
    setSelectedPriceRange('All');
    setSearchQuery('');
    setSearchTrigger('');
    setSortOption('Newest Arrivals');
    setCurrentPage(1);
  };

  return (
    <div className="bg-surface min-h-screen">
      {/* Marketplace Header */}
      <div className="bg-primary pt-12 pb-24 px-6 md:px-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 font-sans"></div>
        <div className="max-w-[1440px] mx-auto relative z-10 text-center animate-fade-up">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Explore the Marketplace</h1>
          <p className="text-primary-fixed-dim text-lg max-w-2xl mx-auto mb-10">
            Discover thousands of high-quality, production-ready textile designs from the world's top independent studios and artists.
          </p>
          
          {/* Main Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline-variant text-[24px]">search</span>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-32 py-5 bg-white rounded-2xl text-on-surface text-lg shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary-fixed/50 transition-all border-none"
              placeholder="Search by pattern name, designer, or tags (e.g., 'geometric')"
            />
            <button type="submit" className="absolute inset-y-2 right-2 px-6 bg-secondary-container text-white rounded-xl font-bold hover:bg-secondary transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-10 -mt-8 relative z-20 pb-24">
        {/* Category Pills */}
        <div className="bg-white rounded-2xl shadow-card p-4 flex items-center justify-between gap-4 overflow-hidden mb-10 border border-outline-variant">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 flex-1">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => { 
                  setActiveCategory(category); 
                  setActiveSubcategory('All');
                  setCurrentPage(1); 
                }}
                className={`whitespace-nowrap px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeCategory === category 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* All Subcategories Visual Grid (Shown when activeCategory is 'All') */}
        {activeCategory === 'All' && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-10 border border-outline-variant animate-fade-in">
            <h3 className="text-xl font-bold text-on-surface text-center mb-8 uppercase tracking-wide">All Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 justify-center">
              {ALL_SUBCATEGORIES_WITH_IMAGES.map(sub => (
                <button
                  key={sub.name}
                  onClick={() => { 
                    setActiveCategory(sub.parentCategory); 
                    setActiveSubcategory(sub.name); 
                    setCurrentPage(1); 
                  }}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-on-surface/80 transition-all duration-300 group-hover:border-primary group-hover:scale-105 group-hover:shadow-md">
                    <img 
                      src={sub.image} 
                      alt={sub.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <span className="mt-3 text-[11px] font-bold uppercase tracking-wider text-center max-w-[120px] transition-colors leading-tight text-on-surface-variant group-hover:text-primary">
                    {sub.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Weaving Subcategories Visual Grid (Image-based like the 2nd image) */}
        {activeCategory === 'Weaving Design' && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-10 border border-outline-variant animate-fade-in">
            <h3 className="text-xl font-bold text-on-surface text-center mb-8 uppercase tracking-wide">Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 justify-center">
              {WEAVING_SUBCATEGORIES_WITH_IMAGES.map(sub => {
                const isActive = activeSubcategory === sub.name;
                return (
                  <button
                    key={sub.name}
                    onClick={() => { setActiveSubcategory(sub.name); setCurrentPage(1); }}
                    className="flex flex-col items-center group focus:outline-none"
                  >
                    <div className={`w-28 h-28 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      isActive 
                        ? 'border-primary ring-4 ring-primary/20 scale-105 shadow-md' 
                        : 'border-on-surface/80 group-hover:border-primary group-hover:scale-102'
                    }`}>
                      <img 
                        src={sub.image} 
                        alt={sub.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <span className={`mt-3 text-[11px] font-bold uppercase tracking-wider text-center max-w-[120px] transition-colors leading-tight ${
                      isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                    }`}>
                      {sub.name === 'All' ? 'All Weaving' : sub.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Embroidery Subcategories Visual Grid */}
        {activeCategory === 'Embroidery Design' && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-10 border border-outline-variant animate-fade-in">
            <h3 className="text-xl font-bold text-on-surface text-center mb-8 uppercase tracking-wide">Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 justify-center">
              {EMBROIDERY_SUBCATEGORIES_WITH_IMAGES.map(sub => {
                const isActive = activeSubcategory === sub.name;
                return (
                  <button
                    key={sub.name}
                    onClick={() => { setActiveSubcategory(sub.name); setCurrentPage(1); }}
                    className="flex flex-col items-center group focus:outline-none"
                  >
                    <div className={`w-28 h-28 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      isActive 
                        ? 'border-primary ring-4 ring-primary/20 scale-105 shadow-md' 
                        : 'border-on-surface/80 group-hover:border-primary group-hover:scale-102'
                    }`}>
                      <img 
                        src={sub.image} 
                        alt={sub.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <span className={`mt-3 text-[11px] font-bold uppercase tracking-wider text-center max-w-[120px] transition-colors leading-tight ${
                      isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                    }`}>
                      {sub.name === 'All' ? 'All Embroidery' : sub.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {((activeCategory !== 'All' || searchTrigger.trim() !== '') && 
          ((designs && designs.length > 0) || 
           activeSubcategory !== 'All' || 
           selectedFabric !== 'All' || 
           selectedPriceRange !== 'All')) && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Advanced Filters Sidebar (Collapsible) */}
            {showFilters && (
              <aside className="w-full lg:w-72 bg-white rounded-2xl border border-outline-variant p-6 shadow-sm shrink-0 animate-fade-in lg:sticky lg:top-24">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-primary">Filters</h3>
                  <button onClick={handleClearAll} className="text-sm font-semibold text-error hover:underline">Clear All</button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-xs text-on-surface mb-3 uppercase tracking-wider">Fabric Type</h4>
                    <div className="space-y-2">
                      {FABRICS.map(fabric => (
                        <label key={fabric} className="flex items-center gap-3 cursor-pointer group text-sm font-semibold">
                          <input 
                            type="radio" 
                            name="fabric"
                            checked={selectedFabric === fabric}
                            onChange={() => { setSelectedFabric(fabric); setCurrentPage(1); }}
                            className="w-4 h-4 text-primary border-outline-variant focus:ring-primary cursor-pointer" 
                          />
                          <span className="text-on-surface-variant group-hover:text-primary transition-colors">{fabric}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-px bg-outline-variant/50"></div>

                  <div>
                    <h4 className="font-semibold text-xs text-on-surface mb-3 uppercase tracking-wider">Price Range</h4>
                    <div className="space-y-2">
                      {PRICE_RANGES.map(price => (
                        <label key={price} className="flex items-center gap-3 cursor-pointer group text-sm font-semibold">
                          <input 
                            type="radio" 
                            name="price" 
                            checked={selectedPriceRange === price}
                            onChange={() => { setSelectedPriceRange(price); setCurrentPage(1); }}
                            className="w-4 h-4 text-primary border-outline-variant focus:ring-primary cursor-pointer" 
                          />
                          <span className="text-on-surface-variant group-hover:text-primary transition-colors">{price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* Design Grid */}
            <div className="flex-1 w-full">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-on-surface-variant">Showing <span className="text-primary">{totalResults}</span> results</p>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-variant text-on-surface rounded-xl font-semibold text-sm hover:bg-outline-variant/30 transition-colors shrink-0 animate-fade-in"
                  >
                    <span className="material-symbols-outlined text-[20px]">tune</span>
                    <span>{showFilters ? 'Hide Filters' : 'Filters'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-on-surface-variant">Sort by:</span>
                  <select 
                    value={sortOption}
                    onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                    className="bg-transparent border-none text-sm font-semibold text-primary focus:outline-none cursor-pointer"
                  >
                    <option>Newest Arrivals</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-20 w-full">
                  <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : designs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {designs.map(design => (
                    <DesignCard key={design.id} design={design} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
                  <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-outline">
                    <span className="material-symbols-outlined text-[32px]">search_off</span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-2">No designs found</h3>
                  <p className="text-on-surface-variant mb-6">Try adjusting your filters or search query to find what you're looking for.</p>
                  <button 
                    onClick={handleClearAll}
                    className="px-6 py-2 bg-primary-container text-white rounded-lg font-semibold hover:bg-primary transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
              
              {/* Pagination */}
              {designs.length > 0 && totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center shadow-sm transition-colors ${
                          currentPage === page ? 'bg-primary text-white' : 'border border-outline-variant text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
