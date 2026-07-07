import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Design } from '../../types';
import { DesignCard } from '../../components/ui/DesignCard';
import { useNotification } from '../../contexts/NotificationContext';

const EMB_DESIGN_TYPES = ['All', 'Flat/Multi Designs', 'Only Cording Designs', 'Only Sequin Designs', 'Only Chain Stitch Designs', 'Multi+Cording Designs'];
const WEAVING_DESIGN_TYPES = ['All', 'Multi+Sequin Designs', 'Multi+Chain Stitch Designs', 'Dual & Sandwich Sequin', '2/4/6 Sequin Design', 'Cording + Sequin Designs'];

const EMB_AREAS = ['All', '100 mm', '125 mm', '150 mm', '175 mm', '200 mm'];
const WEAVING_AREAS = ['All', '300 mm', '330 mm', '400 mm', '500 mm', '600 mm'];

const NEEDLES = ['All', '1', '2', '3', '4', '5'];
const DESIGN_FORMATS = ['All', 'EMB', 'DST', 'JEF', 'PES', 'DHP'];
const SAREE_CONCEPTS = ['All', 'Box Pallu', 'C Pallu', 'Figure', 'Ton to Ton', 'Dhaga Test'];

const ALL_SAREE_SUBCATEGORIES_VALUES = [
  'Saree Design',
  'Kota Lichi Design',
  '50 600 Design',
  'Dolla-Nylon Design',
  'Viscouse Design',
  '(50 600) Satin Design',
  'Nylon Satin Design',
  'Cotton Design',
  'Dharmavarm Design',
  'Pattern Beam Design',
  'Mix Design',
  'Georgept (Crape) Design'
];

const SAREE_SUBCATEGORIES = [
  {
    name: 'All Saree',
    value: 'Saree Design',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: 'Kota Lichi Design',
    value: 'Kota Lichi Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
  },
  {
    name: '50 600 Design',
    value: '50 600 Design',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: 'Dolla-Nylon Design',
    value: 'Dolla-Nylon Design',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=200&h=200&fit=crop',
  },
  {
    name: 'Viscouse Design',
    value: 'Viscouse Design',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: '(50 600) Satin Design',
    value: '(50 600) Satin Design',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
  },
  {
    name: 'Nylon Satin Design',
    value: 'Nylon Satin Design',
    image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=200&h=200&fit=crop',
  },
  {
    name: 'Cotton Design',
    value: 'Cotton Design',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
  },
  {
    name: 'Dharmavarm Design',
    value: 'Dharmavarm Design',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
  },
  {
    name: 'Pattern Beam Design',
    value: 'Pattern Beam Design',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop',
  },
  {
    name: 'Mix Design',
    value: 'Mix Design',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop',
  },
  {
    name: 'Georgept (Crape) Design',
    value: 'Georgept (Crape) Design',
    image: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=200&h=200&fit=crop',
  }
];

const ALL_LEHENGHA_SUBCATEGORIES_VALUES = [
  'Lehengha Design',
  'Lehengha - 50 600 Design',
  'Lehengha - Kota Lichi Design',
  'Lehengha - Viscouse Design',
  'Lehengha - Nylon Satin Design'
];

const LEHENGHA_SUBCATEGORIES = [
  {
    name: 'All Lehengha',
    value: 'Lehengha Design',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
  },
  {
    name: '50 600 Design',
    value: 'Lehengha - 50 600 Design',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: 'Kota Lichi Design',
    value: 'Lehengha - Kota Lichi Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
  },
  {
    name: 'Viscouse Design',
    value: 'Lehengha - Viscouse Design',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: 'Nylon Satin Design',
    value: 'Lehengha - Nylon Satin Design',
    image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=200&h=200&fit=crop',
  }
];

const ALL_SUIT_SUBCATEGORIES_VALUES = [
  'Suit Design',
  'Suit - Kota Lichi Design',
  'Suit - Viscouse Design',
  'Suit - (50 600) Satin Design',
  'Suit - Cotton Design'
];

const SUIT_SUBCATEGORIES = [
  {
    name: 'All Suit',
    value: 'Suit Design',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop',
  },
  {
    name: 'Kota Lichi Design',
    value: 'Suit - Kota Lichi Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
  },
  {
    name: 'Viscouse Design',
    value: 'Suit - Viscouse Design',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: '(50 600) Satin Design',
    value: 'Suit - (50 600) Satin Design',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
  },
  {
    name: 'Cotton Design',
    value: 'Suit - Cotton Design',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
  }
];

const ALL_DUPATTA_SUBCATEGORIES_VALUES = [
  'Dupatta Design',
  'Dupatta - Kota Lichi Design',
  'Dupatta - 50 600 Design',
  'Dupatta - Dolla-Nylon Design',
  'Dupatta - Viscouse Design',
  'Dupatta - (50 600) Satin Design',
  'Dupatta - Nylon Satin Design',
  'Dupatta - Cotton Design'
];

const DUPATTA_SUBCATEGORIES = [
  {
    name: 'All Dupatta',
    value: 'Dupatta Design',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: 'Kota Lichi Design',
    value: 'Dupatta - Kota Lichi Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
  },
  {
    name: '50 600 Design',
    value: 'Dupatta - 50 600 Design',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: 'Dolla-Nylon Design',
    value: 'Dupatta - Dolla-Nylon Design',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=200&h=200&fit=crop',
  },
  {
    name: 'Viscouse Design',
    value: 'Dupatta - Viscouse Design',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: '(50 600) Satin Design',
    value: 'Dupatta - (50 600) Satin Design',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
  },
  {
    name: 'Nylon Satin Design',
    value: 'Dupatta - Nylon Satin Design',
    image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=200&h=200&fit=crop',
  },
  {
    name: 'Cotton Design',
    value: 'Dupatta - Cotton Design',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
  }
];

const getSubcategoryDisplayName = (sub: string) => {
  if (sub.startsWith('Lehengha - ')) return sub.replace('Lehengha - ', '');
  if (sub.startsWith('Suit - ')) return sub.replace('Suit - ', '');
  if (sub.startsWith('Dupatta - ')) return sub.replace('Dupatta - ', '');
  return sub;
};

export function CollectionPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'All';
  const subcategory = searchParams.get('subcategory') || 'All';

  const designTypes = category === 'Weaving Design' ? WEAVING_DESIGN_TYPES : EMB_DESIGN_TYPES;
  const areas = category === 'Weaving Design' ? WEAVING_AREAS : EMB_AREAS;

  const { showToast } = useNotification();
  const [showFilters, setShowFilters] = useState(true);
  const [openFilters, setOpenFilters] = useState({
    designType: true,
    area: true,
    needle: true,
    designFormat: true,
    sareeConcept: true,
  });

  const toggleFilter = (key: keyof typeof openFilters) => {
    setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const [selectedDesignType, setSelectedDesignType] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedNeedle, setSelectedNeedle] = useState('All');
  const [selectedDesignFormat, setSelectedDesignFormat] = useState('All');
  const [selectedSareeConcept, setSelectedSareeConcept] = useState('All');
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

  const fetchDesigns = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 9,
        sort: getBackendSort(sortOption),
      };

      if (category !== 'All') params.category = category;
      if (subcategory !== 'All') params.subcategory = subcategory;
      if (selectedDesignType !== 'All') params.designType = selectedDesignType;
      if (selectedArea !== 'All') params.area = selectedArea;
      if (selectedNeedle !== 'All') params.needle = selectedNeedle;
      if (selectedDesignFormat !== 'All') params.designFormat = selectedDesignFormat;
      if (selectedSareeConcept !== 'All') params.sareeConcept = selectedSareeConcept;

      const response = await api.designs.getAll(params);
      setDesigns(response.designs);
      setTotalPages(response.pages);
      setTotalResults(response.total);
    } catch (error) {
      console.error('Failed to fetch designs:', error);
      showToast('Error loading designs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, [category, subcategory, selectedDesignType, selectedArea, selectedNeedle, selectedDesignFormat, selectedSareeConcept, sortOption, currentPage]);

  const handleClearAll = () => {
    setSelectedDesignType('All');
    setSelectedArea('All');
    setSelectedNeedle('All');
    setSelectedDesignFormat('All');
    setSelectedSareeConcept('All');
    setSortOption('Newest Arrivals');
    setCurrentPage(1);
  };

  return (
    <div className="bg-surface min-h-screen pb-24">
      {/* Header */}
      <div className="bg-primary pt-12 pb-20 px-6 md:px-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-[1440px] mx-auto relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-fixed-dim hover:text-white font-semibold mb-6 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Marketplace
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {subcategory !== 'All' ? getSubcategoryDisplayName(subcategory) : category}
          </h1>
          <p className="text-primary-fixed-dim text-lg">
            Showing designs under {category} {subcategory !== 'All' && `> ${getSubcategoryDisplayName(subcategory)}`}
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-10 mt-10">
        {/* Saree Subcategories Visual Bar */}
        {category === 'Weaving Design' && ALL_SAREE_SUBCATEGORIES_VALUES.includes(subcategory) && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-outline-variant animate-fade-in max-w-6xl mx-auto">
            <h3 className="text-lg font-bold text-on-surface text-center mb-6 uppercase tracking-wider">Saree Subcategories</h3>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {SAREE_SUBCATEGORIES.map(sub => {
                const isActive = subcategory === sub.value;
                return (
                  <Link
                    key={sub.value}
                    to={`/collection?category=Weaving%20Design&subcategory=${encodeURIComponent(sub.value)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center group focus:outline-none w-24 sm:w-28"
                  >
                    <div className={`w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
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
                    <span className={`mt-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-center max-w-full transition-colors leading-tight ${
                      isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                    }`}>
                      {sub.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Lehengha Subcategories Visual Bar */}
        {category === 'Weaving Design' && ALL_LEHENGHA_SUBCATEGORIES_VALUES.includes(subcategory) && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-outline-variant animate-fade-in max-w-5xl mx-auto">
            <h3 className="text-lg font-bold text-on-surface text-center mb-6 uppercase tracking-wider">Lehengha Subcategories</h3>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {LEHENGHA_SUBCATEGORIES.map(sub => {
                const isActive = subcategory === sub.value;
                return (
                  <Link
                    key={sub.value}
                    to={`/collection?category=Weaving%20Design&subcategory=${encodeURIComponent(sub.value)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center group focus:outline-none w-24 sm:w-28"
                  >
                    <div className={`w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
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
                    <span className={`mt-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-center max-w-full transition-colors leading-tight ${
                      isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                    }`}>
                      {sub.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Suit Subcategories Visual Bar */}
        {category === 'Weaving Design' && ALL_SUIT_SUBCATEGORIES_VALUES.includes(subcategory) && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-outline-variant animate-fade-in max-w-5xl mx-auto">
            <h3 className="text-lg font-bold text-on-surface text-center mb-6 uppercase tracking-wider">Suit Subcategories</h3>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {SUIT_SUBCATEGORIES.map(sub => {
                const isActive = subcategory === sub.value;
                return (
                  <Link
                    key={sub.value}
                    to={`/collection?category=Weaving%20Design&subcategory=${encodeURIComponent(sub.value)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center group focus:outline-none w-24 sm:w-28"
                  >
                    <div className={`w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
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
                    <span className={`mt-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-center max-w-full transition-colors leading-tight ${
                      isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                    }`}>
                      {sub.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Dupatta Subcategories Visual Bar */}
        {category === 'Weaving Design' && ALL_DUPATTA_SUBCATEGORIES_VALUES.includes(subcategory) && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-outline-variant animate-fade-in max-w-6xl mx-auto">
            <h3 className="text-lg font-bold text-on-surface text-center mb-6 uppercase tracking-wider">Dupatta Subcategories</h3>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {DUPATTA_SUBCATEGORIES.map(sub => {
                const isActive = subcategory === sub.value;
                return (
                  <Link
                    key={sub.value}
                    to={`/collection?category=Weaving%20Design&subcategory=${encodeURIComponent(sub.value)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center group focus:outline-none w-24 sm:w-28"
                  >
                    <div className={`w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
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
                    <span className={`mt-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-center max-w-full transition-colors leading-tight ${
                      isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                    }`}>
                      {sub.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {(isLoading || !(designs.length === 0 && 
                         selectedDesignType === 'All' && 
                         selectedArea === 'All' && 
                         selectedNeedle === 'All' && 
                         selectedDesignFormat === 'All' && 
                         selectedSareeConcept === 'All')) && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Advanced Filters Sidebar */}
          {showFilters && (
            <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 space-y-4">
              {/* Filters Header Box */}
              <div className="flex justify-between items-center px-4 py-3 bg-white rounded-xl border border-outline-variant/60 shadow-sm">
                <h3 className="font-bold text-base text-primary">Filters</h3>
                <button onClick={handleClearAll} className="text-sm font-bold text-error hover:underline">Clear All</button>
              </div>

              {/* 1. Design Types */}
              <div className="border border-outline-variant/60 bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                <button 
                  onClick={() => toggleFilter('designType')}
                  className="w-full flex justify-between items-center px-4 py-3.5 hover:bg-surface-container-lowest/50 transition-colors text-left"
                >
                  <span className="font-bold text-xs text-on-surface uppercase tracking-wider">Design Types (machines types)</span>
                  <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${openFilters.designType ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
                {openFilters.designType && (
                  <>
                    <div className="w-full h-px bg-outline-variant/50"></div>
                    <div className="px-4 py-3.5 custom-filter-scroll max-h-[185px] overflow-y-auto space-y-2.5">
                      {designTypes.map(type => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer group text-sm font-semibold">
                          <input 
                            type="radio" 
                            name="designType"
                            checked={selectedDesignType === type}
                            onChange={() => { setSelectedDesignType(type); setCurrentPage(1); }}
                            className="w-4 h-4 text-[#ffa500] border-gray-300 focus:ring-[#ffa500] accent-[#ffa500] cursor-pointer" 
                          />
                          <span className="text-[#ffa500] hover:text-[#e69500] transition-colors">{type}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 2. Area */}
              <div className="border border-outline-variant/60 bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                <button 
                  onClick={() => toggleFilter('area')}
                  className="w-full flex justify-between items-center px-4 py-3.5 hover:bg-surface-container-lowest/50 transition-colors text-left"
                >
                  <span className="font-bold text-xs text-on-surface uppercase tracking-wider">Area</span>
                  <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${openFilters.area ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
                {openFilters.area && (
                  <>
                    <div className="w-full h-px bg-outline-variant/50"></div>
                    <div className="px-4 py-3.5 custom-filter-scroll max-h-[185px] overflow-y-auto space-y-2.5">
                      {areas.map(ar => (
                        <label key={ar} className="flex items-center gap-3 cursor-pointer group text-sm font-semibold">
                          <input 
                            type="radio" 
                            name="area"
                            checked={selectedArea === ar}
                            onChange={() => { setSelectedArea(ar); setCurrentPage(1); }}
                            className="w-4 h-4 text-[#ffa500] border-gray-300 focus:ring-[#ffa500] accent-[#ffa500] cursor-pointer" 
                          />
                          <span className="text-[#ffa500] hover:text-[#e69500] transition-colors">{ar}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 3. Needle */}
              <div className="border border-outline-variant/60 bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                <button 
                  onClick={() => toggleFilter('needle')}
                  className="w-full flex justify-between items-center px-4 py-3.5 hover:bg-surface-container-lowest/50 transition-colors text-left"
                >
                  <span className="font-bold text-xs text-on-surface uppercase tracking-wider">Needle</span>
                  <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${openFilters.needle ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
                {openFilters.needle && (
                  <>
                    <div className="w-full h-px bg-outline-variant/50"></div>
                    <div className="px-4 py-3.5 custom-filter-scroll max-h-[185px] overflow-y-auto space-y-2.5">
                      {NEEDLES.map(n => (
                        <label key={n} className="flex items-center gap-3 cursor-pointer group text-sm font-semibold">
                          <input 
                            type="radio" 
                            name="needle"
                            checked={selectedNeedle === n}
                            onChange={() => { setSelectedNeedle(n); setCurrentPage(1); }}
                            className="w-4 h-4 text-[#ffa500] border-gray-300 focus:ring-[#ffa500] accent-[#ffa500] cursor-pointer" 
                          />
                          <span className="text-[#ffa500] hover:text-[#e69500] transition-colors">{n}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 4. Design Format */}
              <div className="border border-outline-variant/60 bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                <button 
                  onClick={() => toggleFilter('designFormat')}
                  className="w-full flex justify-between items-center px-4 py-3.5 hover:bg-surface-container-lowest/50 transition-colors text-left"
                >
                  <span className="font-bold text-xs text-on-surface uppercase tracking-wider">Design Format</span>
                  <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${openFilters.designFormat ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
                {openFilters.designFormat && (
                  <>
                    <div className="w-full h-px bg-outline-variant/50"></div>
                    <div className="px-4 py-3.5 custom-filter-scroll max-h-[185px] overflow-y-auto space-y-2.5">
                      {DESIGN_FORMATS.map(f => (
                        <label key={f} className="flex items-center gap-3 cursor-pointer group text-sm font-semibold">
                          <input 
                            type="radio" 
                            name="designFormat"
                            checked={selectedDesignFormat === f}
                            onChange={() => { setSelectedDesignFormat(f); setCurrentPage(1); }}
                            className="w-4 h-4 text-[#ffa500] border-gray-300 focus:ring-[#ffa500] accent-[#ffa500] cursor-pointer" 
                          />
                          <span className="text-[#ffa500] hover:text-[#e69500] transition-colors">{f}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 5. Saree Concept */}
              <div className="border border-outline-variant/60 bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                <button 
                  onClick={() => toggleFilter('sareeConcept')}
                  className="w-full flex justify-between items-center px-4 py-3.5 hover:bg-surface-container-lowest/50 transition-colors text-left"
                >
                  <span className="font-bold text-xs text-on-surface uppercase tracking-wider">Saree Concept</span>
                  <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${openFilters.sareeConcept ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
                {openFilters.sareeConcept && (
                  <>
                    <div className="w-full h-px bg-outline-variant/50"></div>
                    <div className="px-4 py-3.5 custom-filter-scroll max-h-[185px] overflow-y-auto space-y-2.5">
                      {SAREE_CONCEPTS.map(sc => (
                        <label key={sc} className="flex items-center gap-3 cursor-pointer group text-sm font-semibold">
                          <input 
                            type="radio" 
                            name="sareeConcept"
                            checked={selectedSareeConcept === sc}
                            onChange={() => { setSelectedSareeConcept(sc); setCurrentPage(1); }}
                            className="w-4 h-4 text-[#ffa500] border-gray-300 focus:ring-[#ffa500] accent-[#ffa500] cursor-pointer" 
                          />
                          <span className="text-[#ffa500] hover:text-[#e69500] transition-colors">{sc}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
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
                  className="flex items-center gap-2 px-4 py-2 bg-surface-variant text-on-surface rounded-xl font-semibold text-sm hover:bg-outline-variant/30 transition-colors shrink-0"
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
                <p className="text-on-surface-variant mb-6">Try adjusting your filters to find what you're looking for.</p>
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
