import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Design } from '../../types';
import { DesignCard } from '../../components/ui/DesignCard';
import { useNotification } from '../../contexts/NotificationContext';

const CATEGORIES = ['Weaving Design', 'Embroidery Design', 'Digital Print Design', 'Position Print Design'];
const EMB_DESIGN_TYPES = ['All', 'Flat/Multi Designs', 'Only Cording Designs', 'Only Sequin Designs', 'Only Chain Stitch Designs', 'Multi+Cording Designs'];
const WEAVING_DESIGN_TYPES = ['All', '2 fider design', '3 fider design', '4 fider design', '2688 design', '5376 design(jumbo)', 'power loom design'];

const EMB_AREAS = ['All', '100 mm', '125 mm', '150 mm', '175 mm', '200 mm'];
const WEAVING_AREAS = ['All', '88 to 96', '100 to 110', '112 to 124', '188 to 200', '216 to 240'];

const NEEDLES = ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const DESIGN_FORMATS = ['All', 'EMB', 'DST', 'JEF', 'PES', 'DHP'];
const SAREE_CONCEPTS = ['All', 'Box Pallu', 'C Pallu', 'Figure', 'Ton to Ton', 'Dhaga Test'];
const WEAVING_FORMATS = ['All', 'BMP', 'PDC'];
const WEAVING_CONCEPTS = [
  'All',
  'jumbo design',
  'box pallu',
  'c-pallu',
  'pushmeena',
  'satin',
  'peithani',
  'butt + butti + leriya',
  'cotton',
  'georget',
  'topdyed',
  'nylon'
];
const WEAVING_SUBCATEGORIES_WITH_IMAGES = [
  {
    name: 'All',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop',
  },
  {
    name: 'Saree Design',
    image: '/saree_weaving_design.jpg',
  },
  {
    name: 'Lace Design',
    image: '/lace_weaving_design.jpg',
  },
  {
    name: 'Bulk Package Design',
    image: '/bulk_package_design.png',
  },
  {
    name: 'All Over Design',
    image: '/all_over_weaving_design.jpg',
  },
  {
    name: 'Suit Design',
    image: '/suit_weaving_design.jpg',
  },
  {
    name: 'Dupatta Design',
    image: '/dupatta_weaving_design.jpg',
  },
  {
    name: 'Blouse Design',
    image: '/blouse_weaving_design.jpg',
  },
  {
    name: 'Lehengha Design',
    image: '/lehengha_weaving_design.jpg',
  },
  {
    name: 'Other',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop',
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
  },
  {
    name: 'Other',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  }
];

const DIGITAL_PRINT_SUBCATEGORIES_WITH_IMAGES = [
  {
    name: 'All',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: 'Allover Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
  },
  {
    name: 'Saree Design',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: 'Dupatta Design',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop',
  },
  {
    name: 'Suit + Dupatta Set',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop',
  },
  {
    name: 'Kurti Design',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
  },
  {
    name: 'Sherwani Design',
    image: 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=200&h=200&fit=crop',
  },
  {
    name: 'Daman Design',
    image: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=200&h=200&fit=crop',
  },
  {
    name: 'Tshirt Design',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&h=200&fit=crop',
  },
  {
    name: 'Shirt Design',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&h=200&fit=crop',
  },
  {
    name: 'Kaftan Design',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
  },
  {
    name: 'Pakistani Suit',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: 'Lehenga Design',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
  },
  {
    name: 'Other',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  }
];

const POSITION_PRINT_SUBCATEGORIES_WITH_IMAGES = [
  {
    name: 'All',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=200&h=200&fit=crop',
  },
  {
    name: 'Saree Design',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: 'Dupatta Design',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop',
  },
  {
    name: 'Allover Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
  },
  {
    name: 'Blouse Design',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop',
  },
  {
    name: 'Kali + Lehenga Design',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
  },
  {
    name: 'Other',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=200&h=200&fit=crop',
  }
];

const ALL_SUBCATEGORIES_WITH_IMAGES = [
  {
    name: 'Saree Design',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
    parentCategory: 'Weaving Design'
  },
  {
    name: 'Lace Design',
    image: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=200&h=200&fit=crop',
    parentCategory: 'Weaving Design'
  },
  {
    name: 'Bulk Package Design',
    image: '/bulk_package_design.png',
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
  },
  {
    name: 'Allover Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
    parentCategory: 'Digital Print Design'
  },
  {
    name: 'Saree Design',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
    parentCategory: 'Digital Print Design'
  },
  {
    name: 'Dupatta Design',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop',
    parentCategory: 'Digital Print Design'
  },
  {
    name: 'Suit + Dupatta Set',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop',
    parentCategory: 'Digital Print Design'
  },
  {
    name: 'Kurti Design',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
    parentCategory: 'Digital Print Design'
  },
  {
    name: 'Sherwani Design',
    image: 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=200&h=200&fit=crop',
    parentCategory: 'Digital Print Design'
  },
  {
    name: 'Daman Design',
    image: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=200&h=200&fit=crop',
    parentCategory: 'Digital Print Design'
  },
  {
    name: 'Tshirt Design',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&h=200&fit=crop',
    parentCategory: 'Digital Print Design'
  },
  {
    name: 'Shirt Design',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&h=200&fit=crop',
    parentCategory: 'Digital Print Design'
  },
  {
    name: 'Kaftan Design',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
    parentCategory: 'Digital Print Design'
  },
  {
    name: 'Pakistani Suit',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
    parentCategory: 'Digital Print Design'
  },
  {
    name: 'Lehenga Design',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
    parentCategory: 'Digital Print Design'
  },
  {
    name: 'Saree Design',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
    parentCategory: 'Position Print Design'
  },
  {
    name: 'Dupatta Design',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop',
    parentCategory: 'Position Print Design'
  },
  {
    name: 'Allover Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
    parentCategory: 'Position Print Design'
  },
  {
    name: 'Blouse Design',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop',
    parentCategory: 'Position Print Design'
  },
  {
    name: 'Kali + Lehenga Design',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
    parentCategory: 'Position Print Design'
  },
  {
    name: 'Other',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop',
    parentCategory: 'Weaving Design'
  },
  {
    name: 'Other',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
    parentCategory: 'Embroidery Design'
  },
  {
    name: 'Other',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
    parentCategory: 'Digital Print Design'
  },
  {
    name: 'Other',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=200&h=200&fit=crop',
    parentCategory: 'Position Print Design'
  }
];

export function Marketplace() {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [activeCategory, setActiveCategory] = useState('Weaving Design');

  const designTypes = activeCategory === 'Weaving Design' ? WEAVING_DESIGN_TYPES : EMB_DESIGN_TYPES;
  const areas = activeCategory === 'Weaving Design' ? WEAVING_AREAS : EMB_AREAS;
  const needles = activeCategory === 'Weaving Design' ? ['All', '36 to 42', '43 to 48', '50 to 60', '61 to 70', '71 to 80', '80 to 90'] : ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const formats = activeCategory === 'Weaving Design' ? WEAVING_FORMATS : DESIGN_FORMATS;
  const concepts = activeCategory === 'Weaving Design' ? WEAVING_CONCEPTS : SAREE_CONCEPTS;
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [openFilters, setOpenFilters] = useState(() => {
    const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
    return {
      designType: isDesktop,
      area: isDesktop,
      needle: isDesktop,
      designFormat: isDesktop,
      sareeConcept: isDesktop,
    };
  });

  const toggleFilter = (key: keyof typeof openFilters) => {
    setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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
    if (!searchTrigger.trim()) {
      setDesigns([]);
      setTotalPages(1);
      setTotalResults(0);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 9,
        sort: getBackendSort(sortOption),
      };

      if (activeCategory !== 'All') params.category = activeCategory;
      if ((activeCategory === 'Weaving Design' || activeCategory === 'Embroidery Design' || activeCategory === 'Digital Print Design' || activeCategory === 'Position Print Design') && activeSubcategory !== 'All') {
        params.subcategory = activeSubcategory;
      }
      if (selectedDesignType !== 'All') params.designType = selectedDesignType;
      if (selectedArea !== 'All') params.area = selectedArea;
      if (selectedNeedle !== 'All') params.needle = selectedNeedle;
      if (selectedDesignFormat !== 'All') params.designFormat = selectedDesignFormat;
      if (selectedSareeConcept !== 'All') params.sareeConcept = selectedSareeConcept;
      if (searchTrigger.trim()) params.search = searchTrigger;

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
  }, [activeCategory, activeSubcategory, selectedDesignType, selectedArea, selectedNeedle, selectedDesignFormat, selectedSareeConcept, sortOption, currentPage, searchTrigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTrigger(searchQuery);
  };

  const handleClearAll = () => {
    setActiveCategory('All');
    setActiveSubcategory('All');
    setSelectedDesignType('All');
    setSelectedArea('All');
    setSelectedNeedle('All');
    setSelectedDesignFormat('All');
    setSelectedSareeConcept('All');
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
          <div className="grid grid-cols-2 md:flex md:overflow-x-auto hide-scrollbar gap-2 pb-1 flex-1 w-full">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => { 
                  setActiveCategory(category); 
                  setActiveSubcategory('All');
                  setCurrentPage(1); 
                }}
                className={`text-center px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-colors md:whitespace-nowrap ${
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
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6 justify-center">
              {ALL_SUBCATEGORIES_WITH_IMAGES.map(sub => (
                <Link
                  key={`${sub.parentCategory}-${sub.name}`}
                  to={`/collection?category=${encodeURIComponent(sub.parentCategory)}&subcategory=${encodeURIComponent(sub.name)}`}
                  className="flex flex-col items-center group focus:outline-none w-full"
                >
                  <div className="w-full max-w-[96px] sm:max-w-[112px] aspect-square rounded-2xl overflow-hidden border-2 border-on-surface/80 transition-all duration-300 group-hover:border-primary group-hover:scale-105 group-hover:shadow-md">
                    <img 
                      src={sub.image} 
                      alt={sub.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <span className="mt-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-center max-w-full transition-colors leading-tight text-on-surface-variant group-hover:text-primary">
                    {sub.name.replace(/\s*design\s*/gi, '')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Weaving Subcategories Visual Grid (Image-based like the 2nd image) */}
        {activeCategory === 'Weaving Design' && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-10 border border-outline-variant animate-fade-in">
            <h3 className="text-xl font-bold text-on-surface text-center mb-8 uppercase tracking-wide">Categories</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6 justify-center">
              {WEAVING_SUBCATEGORIES_WITH_IMAGES.map(sub => {
                const isActive = activeSubcategory === sub.name;
                return (
                  <Link
                    key={sub.name}
                    to={`/collection?category=Weaving%20Design&subcategory=${encodeURIComponent(sub.name)}`}
                    className="flex flex-col items-center group focus:outline-none w-full"
                  >
                    <div className={`w-full max-w-[96px] sm:max-w-[112px] aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
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
                    <span className={`mt-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-center max-w-full transition-colors leading-tight ${
                      isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                    }`}>
                      {sub.name === 'All' ? 'All Weaving' : sub.name.replace(/\s*design\s*/gi, '')}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Embroidery Subcategories Visual Grid */}
        {activeCategory === 'Embroidery Design' && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-10 border border-outline-variant animate-fade-in">
            <h3 className="text-xl font-bold text-on-surface text-center mb-8 uppercase tracking-wide">Categories</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6 justify-center">
              {EMBROIDERY_SUBCATEGORIES_WITH_IMAGES.map(sub => {
                const isActive = activeSubcategory === sub.name;
                return (
                  <Link
                    key={sub.name}
                    to={`/collection?category=Embroidery%20Design&subcategory=${encodeURIComponent(sub.name)}`}
                    className="flex flex-col items-center group focus:outline-none w-full"
                  >
                    <div className={`w-full max-w-[96px] sm:max-w-[112px] aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
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
                    <span className={`mt-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-center max-w-full transition-colors leading-tight ${
                      isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                    }`}>
                      {sub.name === 'All' ? 'All Embroidery' : sub.name.replace(/\s*design\s*/gi, '')}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Digital Print Subcategories Visual Grid */}
        {activeCategory === 'Digital Print Design' && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-10 border border-outline-variant animate-fade-in">
            <h3 className="text-xl font-bold text-on-surface text-center mb-8 uppercase tracking-wide">Categories</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6 justify-center">
              {DIGITAL_PRINT_SUBCATEGORIES_WITH_IMAGES.map(sub => {
                const isActive = activeSubcategory === sub.name;
                return (
                  <Link
                    key={sub.name}
                    to={`/collection?category=Digital%20Print%20Design&subcategory=${encodeURIComponent(sub.name)}`}
                    className="flex flex-col items-center group focus:outline-none w-full"
                  >
                    <div className={`w-full max-w-[96px] sm:max-w-[112px] aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
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
                    <span className={`mt-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-center max-w-full transition-colors leading-tight ${
                      isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                    }`}>
                      {sub.name === 'All' ? 'All Digital Print' : sub.name.replace(/\s*design\s*/gi, '')}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Position Print Subcategories Visual Grid */}
        {activeCategory === 'Position Print Design' && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-10 border border-outline-variant animate-fade-in">
            <h3 className="text-xl font-bold text-on-surface text-center mb-8 uppercase tracking-wide">Categories</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6 justify-center">
              {POSITION_PRINT_SUBCATEGORIES_WITH_IMAGES.map(sub => {
                const isActive = activeSubcategory === sub.name;
                return (
                  <Link
                    key={sub.name}
                    to={`/collection?category=Position%20Print%20Design&subcategory=${encodeURIComponent(sub.name)}`}
                    className="flex flex-col items-center group focus:outline-none w-full"
                  >
                    <div className={`w-full max-w-[96px] sm:max-w-[112px] aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
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
                    <span className={`mt-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-center max-w-full transition-colors leading-tight ${
                      isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                    }`}>
                      {sub.name === 'All' ? 'All Position Print' : sub.name.replace(/\s*design\s*/gi, '')}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {searchTrigger.trim() !== '' && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Advanced Filters Sidebar (Collapsible) — Only for Weaving Design */}
            {showFilters && activeCategory === 'Weaving Design' && (
              <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 space-y-4">


                {/* 1. Design Types */}
                <div className="border border-outline-variant/60 bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                  <button 
                    onClick={() => toggleFilter('designType')}
                    className="w-full flex justify-between items-center px-4 py-3.5 hover:bg-surface-container-lowest/50 transition-colors text-left"
                  >
                    <span className="font-bold text-xs text-primary uppercase tracking-wider">Design Types (machines types)</span>
                    <span className={`material-symbols-outlined text-primary/80 transition-transform duration-200 ${openFilters.designType ? 'rotate-180' : ''}`}>
                      keyboard_arrow_down
                    </span>
                  </button>
                  {openFilters.designType && (
                    <>
                      <div className="w-full h-px bg-outline-variant/50"></div>
                      <div className="px-4 py-3.5 bg-white custom-filter-scroll max-h-[185px] overflow-y-auto space-y-2.5">
                        {designTypes.map(type => (
                          <label key={type} className="flex items-center gap-3 cursor-pointer group text-sm font-medium">
                            <input 
                              type="radio" 
                              name="designType"
                              checked={selectedDesignType === type}
                              onChange={() => { setSelectedDesignType(type); setCurrentPage(1); }}
                              className="w-4 h-4 accent-primary cursor-pointer" 
                            />
                            <span className={`transition-colors ${selectedDesignType === type ? 'text-primary font-semibold' : 'text-on-surface-variant group-hover:text-primary'}`}>{type}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 2. Reed & Pick */}
                <div className="border border-outline-variant/60 bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                  <button 
                    onClick={() => toggleFilter('area')}
                    className="w-full flex justify-between items-center px-4 py-3.5 hover:bg-surface-container-lowest/50 transition-colors text-left"
                  >
                    <span className="font-bold text-xs text-primary uppercase tracking-wider">{activeCategory === 'Weaving Design' ? 'Reed' : 'Area'}</span>
                    <span className={`material-symbols-outlined text-primary/80 transition-transform duration-200 ${openFilters.area ? 'rotate-180' : ''}`}>
                      keyboard_arrow_down
                    </span>
                  </button>
                  {openFilters.area && (
                    <>
                      <div className="w-full h-px bg-outline-variant/50"></div>
                      <div className="px-4 py-3.5 bg-white custom-filter-scroll max-h-[185px] overflow-y-auto space-y-2.5">
                        {areas.map(ar => (
                          <label key={ar} className="flex items-center gap-3 cursor-pointer group text-sm font-medium">
                            <input 
                              type="radio" 
                              name="area"
                              checked={selectedArea === ar}
                              onChange={() => { setSelectedArea(ar); setCurrentPage(1); }}
                              className="w-4 h-4 accent-primary cursor-pointer" 
                            />
                            <span className={`transition-colors ${selectedArea === ar ? 'text-primary font-semibold' : 'text-on-surface-variant group-hover:text-primary'}`}>{ar}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 3. Color */}
                <div className="border border-outline-variant/60 bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                  <button 
                    onClick={() => toggleFilter('needle')}
                    className="w-full flex justify-between items-center px-4 py-3.5 hover:bg-surface-container-lowest/50 transition-colors text-left"
                  >
                    <span className="font-bold text-xs text-primary uppercase tracking-wider">{activeCategory === 'Weaving Design' ? 'Pick' : 'Color'}</span>
                    <span className={`material-symbols-outlined text-primary/80 transition-transform duration-200 ${openFilters.needle ? 'rotate-180' : ''}`}>
                      keyboard_arrow_down
                    </span>
                  </button>
                  {openFilters.needle && (
                    <>
                      <div className="w-full h-px bg-outline-variant/50"></div>
                      <div className="px-4 py-3.5 bg-white custom-filter-scroll max-h-[185px] overflow-y-auto space-y-2.5">
                        {needles.map(n => (
                          <label key={n} className="flex items-center gap-3 cursor-pointer group text-sm font-medium">
                            <input 
                              type="radio" 
                              name="needle"
                              checked={selectedNeedle === n}
                              onChange={() => { setSelectedNeedle(n); setCurrentPage(1); }}
                              className="w-4 h-4 accent-primary cursor-pointer" 
                            />
                            <span className={`transition-colors ${selectedNeedle === n ? 'text-primary font-semibold' : 'text-on-surface-variant group-hover:text-primary'}`}>{n}</span>
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
                    <span className="font-bold text-xs text-primary uppercase tracking-wider">Design Format</span>
                    <span className={`material-symbols-outlined text-primary/80 transition-transform duration-200 ${openFilters.designFormat ? 'rotate-180' : ''}`}>
                      keyboard_arrow_down
                    </span>
                  </button>
                  {openFilters.designFormat && (
                    <>
                      <div className="w-full h-px bg-outline-variant/50"></div>
                      <div className="px-4 py-3.5 bg-white custom-filter-scroll max-h-[185px] overflow-y-auto space-y-2.5">
                        {formats.map(f => (
                          <label key={f} className="flex items-center gap-3 cursor-pointer group text-sm font-medium">
                            <input 
                              type="radio" 
                              name="designFormat"
                              checked={selectedDesignFormat === f}
                              onChange={() => { setSelectedDesignFormat(f); setCurrentPage(1); }}
                              className="w-4 h-4 accent-primary cursor-pointer" 
                            />
                            <span className={`transition-colors ${selectedDesignFormat === f ? 'text-primary font-semibold' : 'text-on-surface-variant group-hover:text-primary'}`}>{f}</span>
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
                    <span className="font-bold text-xs text-primary uppercase tracking-wider">
                      {activeCategory === 'Weaving Design' ? 'Design Concept' : 'Saree Concept'}
                    </span>
                    <span className={`material-symbols-outlined text-primary/80 transition-transform duration-200 ${openFilters.sareeConcept ? 'rotate-180' : ''}`}>
                      keyboard_arrow_down
                    </span>
                  </button>
                  {openFilters.sareeConcept && (
                    <>
                      <div className="w-full h-px bg-outline-variant/50"></div>
                      <div className="px-4 py-3.5 bg-white custom-filter-scroll max-h-[185px] overflow-y-auto space-y-2.5">
                        {concepts.map(sc => (
                          <label key={sc} className="flex items-center gap-3 cursor-pointer group text-sm font-medium">
                            <input 
                              type="radio" 
                              name="sareeConcept"
                              checked={selectedSareeConcept === sc}
                              onChange={() => { setSelectedSareeConcept(sc); setCurrentPage(1); }}
                              className="w-4 h-4 accent-primary cursor-pointer" 
                            />
                            <span className={`transition-colors ${selectedSareeConcept === sc ? 'text-primary font-semibold' : 'text-on-surface-variant group-hover:text-primary'}`}>{sc}</span>
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
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-6">
              <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                <p className="text-sm font-semibold text-on-surface-variant">Showing <span className="text-primary">{totalResults}</span> results</p>
                {activeCategory === 'Weaving Design' && (
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-surface-variant text-on-surface rounded-xl font-semibold text-xs sm:text-sm hover:bg-outline-variant/30 transition-colors shrink-0 animate-fade-in"
                >
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">tune</span>
                  <span>{showFilters ? 'Hide Filters' : 'Filters'}</span>
                </button>
                )}
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t border-outline-variant/30 pt-3 sm:border-t-0 sm:pt-0">
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
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
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
