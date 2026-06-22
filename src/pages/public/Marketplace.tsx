import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Design } from '../../types';
import { DesignCard } from '../../components/ui/DesignCard';
import { useNotification } from '../../contexts/NotificationContext';

const CATEGORIES = ['All', 'Geometric', 'Floral', 'Watercolor', 'Technical', 'Tapestry', 'Organic', 'Abstract'];
const FABRICS = ['All', 'Cotton Blend', 'Silk', 'Linen', 'Polyester Blend', 'Wool Blend', 'Cotton Sateen'];
const PRICE_RANGES = ['All', 'Under $500', '$500 - $800', '$800 - $1000', 'Over $1000'];

export function Marketplace() {
  const { showToast } = useNotification();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [sortOption, setSortOption] = useState('Recommended');
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
  }, [activeCategory, selectedFabric, selectedPriceRange, sortOption, currentPage, searchTrigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTrigger(searchQuery);
  };

  const handleClearAll = () => {
    setActiveCategory('All');
    setSelectedFabric('All');
    setSelectedPriceRange('All');
    setSearchQuery('');
    setSearchTrigger('');
    setSortOption('Recommended');
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
                onClick={() => { setActiveCategory(category); setCurrentPage(1); }}
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
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-variant text-on-surface rounded-xl font-semibold text-sm hover:bg-outline-variant/30 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
            <span>Filters</span>
          </button>
        </div>

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
              <p className="text-sm font-semibold text-on-surface-variant">Showing <span className="text-primary">{totalResults}</span> results</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-on-surface-variant">Sort by:</span>
                <select 
                  value={sortOption}
                  onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent border-none text-sm font-semibold text-primary focus:outline-none cursor-pointer"
                >
                  <option>Recommended</option>
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
      </div>
    </div>
  );
}
