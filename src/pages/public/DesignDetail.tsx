import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import type { Design } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { ImageLightbox } from '../../components/ui/ImageLightbox';
import { WatermarkedImage } from '../../components/ui/WatermarkedImage';
import { optimizeCloudinaryUrl } from '../../utils/imageOptimize';

const getParentSubcategory = (sub: string): string => {
  const ALL_SAREE_SUBCATEGORIES_VALUES = [
    'Saree Design', 'Kota Lichi Design', '50 600 Design', 'Dolla-Nylon Design', 'Viscouse Design',
    '(50 600) Satin Design', 'Nylon Satin Design', 'Cotton Design', 'Dharmavarm Design',
    'Pattern Beam Design', 'Mix Design', 'Georgept (Crape) Design'
  ];
  const ALL_LEHENGHA_SUBCATEGORIES_VALUES = [
    'Lehengha Design', 'Lehengha - 50 600 Design', 'Lehengha - Kota Lichi Design',
    'Lehengha - Viscouse Design', 'Lehengha - Nylon Satin Design'
  ];
  const ALL_SUIT_SUBCATEGORIES_VALUES = [
    'Suit Design', 'Suit - Kota Lichi Design', 'Suit - Viscouse Design',
    'Suit - (50 600) Satin Design', 'Suit - Cotton Design'
  ];
  const ALL_DUPATTA_SUBCATEGORIES_VALUES = [
    'Dupatta Design', 'Dupatta - Kota Lichi Design', 'Dupatta - 50 600 Design',
    'Dupatta - Dolla-Nylon Design', 'Dupatta - Viscouse Design', 'Dupatta - (50 600) Satin Design',
    'Dupatta - Nylon Satin Design', 'Dupatta - Cotton Design'
  ];
  const ALL_MEKHENA_CHADAR_SUBCATEGORIES_VALUES = [
    'Mekhena + Chadar Design', 'Mekhena + Chadar - Kota Lichi Design', 'Mekhena + Chadar - 50 600 Design',
    'Mekhena + Chadar - Nylon Design', 'Mekhena + Chadar - Cotton Sprun Design'
  ];
  const ALL_MULTI_SUBCATEGORIES_VALUES = [
    'Multi Design', 'Saree Daman', 'C Pallu - Box Pallu', 'Gala-Nack-Single Head',
    'Kurti-Gala', 'Buta', 'Buti', 'Sut Daman & Dupta', 'Lace', 'Figar', 'Garment-Servani',
    'Penal-Pta', 'Choli-Kli', 'Blouse', 'Rajasthani-Kli', 'Lengha-Kli', 'Patli Daman',
    'Cross Stitch', 'Kasmiri Design', 'Jal', 'Gamthi Design'
  ];
  const ALL_SEQUIN_SUBCATEGORIES_VALUES = [
    'Sequin Design', 'Dual-Sq', 'Bhugali-Sq', 'Garment & Servani', 'Gala-Top & Tabla',
    'Daman', 'Sut-Daman & Dupta', 'Choli & Blouse', 'Buta', 'Buti Small', 'Kli-Lengha',
    'C Pallu', 'Lace', 'Figar Design', 'No Panching'
  ];
  const ALL_CORDING_SUBCATEGORIES_VALUES = [
    'Cording Design', 'Lengha-Kli', 'Choli', 'Gala & Servani', 'Garment & Jal', 'Daman',
    'Lace', 'C Pallu', 'Dual-Cording Sq', 'Figar Design', 'Buta', 'Blouse', 'Dupta-Only',
    'Buti', 'No Panching'
  ];
  const ALL_CHAIN_SUBCATEGORIES_VALUES = [
    'Chain Design', 'Pallu-Scat', 'Patli & Kli', 'Gala & Nack', 'Garment & Jal',
    'Penal-Patta', 'Figar Design', 'Buta', 'C Pallu', 'Blouse', 'No Panching'
  ];
  const ALL_BEADS_SUBCATEGORIES_VALUES = [
    'Beads Design', 'Kli Beads Design', 'C-Pallu Beads Design', 'Daman Beads Design', 'Gala beads Design'
  ];

  if (ALL_SAREE_SUBCATEGORIES_VALUES.includes(sub)) return 'Saree Design';
  if (ALL_LEHENGHA_SUBCATEGORIES_VALUES.includes(sub)) return 'Lehengha Design';
  if (ALL_SUIT_SUBCATEGORIES_VALUES.includes(sub)) return 'Suit Design';
  if (ALL_DUPATTA_SUBCATEGORIES_VALUES.includes(sub)) return 'Dupatta Design';
  if (ALL_MEKHENA_CHADAR_SUBCATEGORIES_VALUES.includes(sub)) return 'Mekhena + Chadar Design';
  if (ALL_MULTI_SUBCATEGORIES_VALUES.includes(sub)) return 'Multi Design';
  if (ALL_SEQUIN_SUBCATEGORIES_VALUES.includes(sub)) return 'Sequin Design';
  if (ALL_CORDING_SUBCATEGORIES_VALUES.includes(sub)) return 'Cording Design';
  if (ALL_CHAIN_SUBCATEGORIES_VALUES.includes(sub)) return 'Chain Design';
  if (ALL_BEADS_SUBCATEGORIES_VALUES.includes(sub)) return 'Beads Design';
  return 'All';
};

const getSubcategoryDisplayName = (sub: string) => {
  if (sub.startsWith('Lehengha - ')) return sub.replace('Lehengha - ', '');
  if (sub.startsWith('Suit - ')) return sub.replace('Suit - ', '');
  if (sub.startsWith('Dupatta - ')) return sub.replace('Dupatta - ', '');
  if (sub.startsWith('Mekhena + Chadar - ')) return sub.replace('Mekhena + Chadar - ', '');
  return sub;
};

export function DesignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  const [design, setDesign] = useState<Design | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLicense, setSelectedLicense] = useState('EMB');
  const [activeTab, setActiveTab] = useState('details');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeImage, setActiveImage] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const mainWheelTimer = useRef<number>(0);

  useEffect(() => {
    const fetchDesign = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await api.designs.getById(id);
        setDesign(data);
        setActiveImage(data.image);
        setActiveImageIndex(0);
        if (data.category === 'Weaving Design') {
          setSelectedLicense('BMP');
        } else if (data.category === 'Digital Print Design' || data.category === 'Position Print Design') {
          setSelectedLicense(data.designFormat === 'TIF' ? 'TIF' : 'PSD');
        } else {
          setSelectedLicense('EMB');
        }
      } catch (err: any) {
        console.error(err);
        setError('Design not found or failed to load');
        showToast('Failed to load design details', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDesign();
  }, [id, showToast]);

  const allImagesRaw = design ? [design.image, ...(design.additionalImages || [])].filter(Boolean) : [];
  const allImages = allImagesRaw.map(img => optimizeCloudinaryUrl(img, 'detail'));
  const allImagesThumbnail = allImagesRaw.map(img => optimizeCloudinaryUrl(img, 'thumbnail'));

  const handleImageSelect = (idx: number) => {
    if (allImages[idx]) {
      setActiveImageIndex(idx);
      setActiveImage(allImages[idx]);
    }
  };

  const handleMainImageWheel = (e: React.WheelEvent) => {
    if (allImages.length <= 1) return;
    const now = Date.now();
    if (now - mainWheelTimer.current < 200) return;

    if (e.deltaY > 0 || e.deltaX > 0) {
      mainWheelTimer.current = now;
      const nextIdx = (activeImageIndex + 1) % allImages.length;
      handleImageSelect(nextIdx);
    } else if (e.deltaY < 0 || e.deltaX < 0) {
      mainWheelTimer.current = now;
      const prevIdx = (activeImageIndex - 1 + allImages.length) % allImages.length;
      handleImageSelect(prevIdx);
    }
  };

  const isWishlisted = design ? isInWishlist(design.id) : false;

  const handleAddToCart = () => {
    if (!design) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(design, selectedLicense);
  };

  const getPrice = (price: number, license: string) => {
    if (license === 'Extended' || license === 'Other' || license === 'OTHER') return price * 2.5;
    if (license === 'PDC' || license === 'TIF') {
      return design && design.pdcPrice && design.pdcPrice > 0 ? design.pdcPrice : price * 2.5;
    }
    if (license === 'Exclusive Buyout') return price * 8;
    return price;
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-surface flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-surface flex flex-col justify-center items-center p-6 text-center">
        <span className="material-symbols-outlined text-[64px] text-outline mb-4">error</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Something went wrong</h2>
        <p className="text-on-surface-variant mb-6">{error || 'Design not found'}</p>
        <Link to="/marketplace" className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-colors shadow-sm">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const licenseOptions = (() => {
    if (design.category === 'Weaving Design') {
      const pdcPriceVal = design.pdcPrice && design.pdcPrice > 0 ? design.pdcPrice : design.price * 2.5;
      return [
        { name: 'BMP', price: design.price, desc: 'BMP format. Standard production license.' },
        { name: 'PDC', price: pdcPriceVal, desc: 'PDC format. Extended production license.' }
      ];
    } else if (design.category === 'Digital Print Design' || design.category === 'Position Print Design') {
      const options = [];
      const format = design.designFormat ? design.designFormat.toUpperCase() : 'ALL';
      if (format === 'ALL' || format === 'PSD') {
        options.push({ name: 'PSD', price: design.price, desc: 'PSD format. Standard print license.' });
      }
      if (format === 'ALL' || format === 'TIF') {
        const tifPrice = design.pdcPrice && design.pdcPrice > 0 ? design.pdcPrice : design.price * 2.5;
        options.push({ name: 'TIF', price: tifPrice, desc: 'TIF format. High-resolution print format.' });
      }
      return options;
    } else {
      return [
        { name: 'EMB', price: design.price, desc: 'EMB format. Standard embroidery license.' },
        { name: 'OTHER', price: design.price * 2.5, desc: 'Other formats (DST, PES, JEF, etc.).' }
      ];
    }
  })();

  return (
    <div className="bg-surface min-h-screen pb-24">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-outline-variant">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-4 flex items-center gap-2 text-sm flex-wrap">
          <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          
          <Link 
            to={`/collection?category=${encodeURIComponent(design.category)}`} 
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            {design.category}
          </Link>
          
          {design.subcategory && design.subcategory !== 'All' && design.subcategory !== '' && (() => {
            const parentSub = getParentSubcategory(design.subcategory);
            if (parentSub !== 'All' && parentSub !== design.subcategory) {
              return (
                <>
                  <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                  <Link 
                    to={`/collection?category=${encodeURIComponent(design.category)}&subcategory=${encodeURIComponent(parentSub)}`} 
                    className="text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {getSubcategoryDisplayName(parentSub)}
                  </Link>
                  <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                  <Link 
                    to={`/collection?category=${encodeURIComponent(design.category)}&subcategory=${encodeURIComponent(design.subcategory)}&showAll=true`} 
                    className="text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {getSubcategoryDisplayName(design.subcategory)}
                  </Link>
                </>
              );
            } else {
              return (
                <>
                  <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                  <Link 
                    to={`/collection?category=${encodeURIComponent(design.category)}&subcategory=${encodeURIComponent(design.subcategory)}`} 
                    className="text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {getSubcategoryDisplayName(design.subcategory)}
                  </Link>
                </>
              );
            }
          })()}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-10 pt-8 animate-fade-in animate-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left: Image Gallery or PDF Viewer */}
          {design.isBulk && design.pdfUrl ? (
            <div className="lg:col-span-7 space-y-6">
              {/* PDF Presentation Card */}
              <div className="relative rounded-2xl overflow-hidden bg-white border border-outline-variant shadow-sm p-8 flex flex-col items-center justify-center min-h-[300px]">
                <div className="absolute top-4 left-4 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-red-200">
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  PDF Catalog Mode
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(design);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 bg-surface-container rounded-full flex items-center justify-center hover:bg-white text-on-surface-variant transition-colors shadow-sm"
                  title="Add to Wishlist"
                >
                  <span className={`material-symbols-outlined text-[20px] ${isWishlisted ? 'filled text-error' : ''}`}>favorite</span>
                </button>

                <div className="text-center max-w-md mx-auto space-y-4 py-4">
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-red-100">
                    <span className="material-symbols-outlined text-[36px]">picture_as_pdf</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">Bulk Design Catalog</h2>
                    <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                      This design contains a bulk catalog PDF. You can preview it inside the interactive viewer below or view it in a full browser tab.
                    </p>
                  </div>
                  <div className="pt-2">
                    <a
                      href={design.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-xs hover:bg-primary-container hover:text-primary transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      Open Catalog PDF
                    </a>
                  </div>
                </div>
              </div>

              {/* Embedded PDF IFrame Viewer */}
              <div className="rounded-2xl border border-outline-variant overflow-hidden shadow-sm h-[600px] bg-surface-container">
                <iframe
                  src={`${design.pdfUrl}#toolbar=0`}
                  className="w-full h-full border-none"
                  title="PDF Catalog Preview"
                />
              </div>
            </div>
          ) : (
            (() => {
              const galleryImages = (allImages && allImages.length > 0)
                ? allImages
                : [design.image, design.image, design.image, design.image];
              const activeImg = galleryImages[activeImageIndex] || galleryImages[selectedImageIndex] || design.image;

              return (
                <div className="lg:col-span-7 space-y-4">
                  <div 
                    onWheel={handleMainImageWheel}
                    onClick={() => setIsLightboxOpen(true)}
                    className="relative rounded-2xl overflow-hidden bg-surface-container border border-outline-variant group cursor-zoom-in shadow-sm hover:shadow-md transition-shadow"
                    title="Click to view full screen image modal or scroll wheel to switch photos"
                  >
                    <WatermarkedImage src={activeImg} alt={design.title} designId={design.title || design.id} density="dense" className="w-full h-[600px] object-cover transition-transform duration-300 group-hover:scale-102" />
                    
                    {/* Click to expand overlay hint */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10">
                      <div className="bg-black/75 backdrop-blur text-white px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 shadow-lg border border-white/20">
                        <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                        Click to open full view
                      </div>
                    </div>

                    {/* Photo Counter badge */}
                    {galleryImages.length > 1 && (
                      <div className="absolute top-6 left-6 bg-black/60 backdrop-blur text-white text-xs font-semibold px-3.5 py-1.5 rounded-full z-10 flex items-center gap-1.5 border border-white/10 shadow-sm">
                        <span className="material-symbols-outlined text-[15px]">photo_library</span>
                        {activeImageIndex + 1} / {galleryImages.length}
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(design);
                      }}
                      className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-modal z-20"
                      title="Add to Wishlist"
                    >
                      <span className={`material-symbols-outlined text-[24px] ${isWishlisted ? 'filled text-error' : 'text-on-surface-variant'}`}>favorite</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-3 sm:gap-4">
                    {galleryImages.map((img, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          handleImageSelect(i);
                          setSelectedImageIndex(i);
                        }}
                        className={`relative rounded-xl overflow-hidden bg-surface-container border-2 cursor-pointer h-20 sm:h-24 transition-all duration-200 ${i === activeImageIndex ? 'border-primary ring-2 ring-primary/30 scale-105 opacity-100' : 'border-outline-variant/30 hover:border-primary/50 opacity-70 hover:opacity-100'}`}
                      >
                        <WatermarkedImage src={allImagesThumbnail[i] || img} alt={`Thumbnail ${i + 1}`} designId={design.title || design.id} density="compact" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          )}

          {/* Right: Product Details */}
          <div className="lg:col-span-5 space-y-8 lg:pl-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {design.discountPercentage && design.discountPercentage > 0 ? (
                  <span className="bg-emerald-600 text-white px-3 py-1 rounded font-extrabold text-xs uppercase tracking-wider shadow flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">local_offer</span>
                    {design.offerName || 'Special Offer'} · {design.discountPercentage}% OFF
                  </span>
                ) : null}
                <span className="bg-primary-fixed text-primary px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">{design.category}</span>
                {design.badge && <span className="bg-secondary-container text-on-secondary px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">{design.badge}</span>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-2 leading-tight">{design.title}</h1>
              <div className="flex items-center gap-4 text-sm text-on-surface-variant mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                    {design.designerAvatar}
                  </div>
                  <span className="font-semibold text-primary hover:underline cursor-pointer">{design.designerName}</span>
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
                        <span className="font-bold text-primary-container">₹{option.price.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-outline-variant/50">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-on-surface-variant text-sm block">Total Payment</span>
                    {design.discountPercentage && design.discountPercentage > 0 ? (
                      <span className="text-xs font-bold text-emerald-700">{design.offerName || 'Promotional Offer'} ({design.discountPercentage}% OFF Applied)</span>
                    ) : null}
                  </div>
                  <div className="text-right">
                    {design.originalPrice && design.originalPrice > design.price ? (
                      <div>
                        <span className="text-xs text-on-surface-variant line-through font-semibold block">Original: ₹{getPrice(design.originalPrice, selectedLicense).toLocaleString()}</span>
                        <span className="text-3xl font-extrabold text-emerald-700">₹{getPrice(design.price, selectedLicense).toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-primary">₹{getPrice(design.price, selectedLicense).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <button onClick={handleAddToCart} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2 group">
                  <span className="material-symbols-outlined group-hover:scale-110 transition-transform">shopping_cart</span>
                  Add to Cart
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
              <div className="flex border-b border-outline-variant">
                <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 text-sm md:text-[15px] font-semibold transition-colors ${activeTab === 'details' ? 'text-primary border-b-2 border-primary bg-primary-fixed/5' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>Details</button>
                <button onClick={() => setActiveTab('specs')} className={`flex-1 py-4 text-sm md:text-[15px] font-semibold transition-colors ${activeTab === 'specs' ? 'text-primary border-b-2 border-primary bg-primary-fixed/5' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>Specifications</button>
              </div>
              <div className="p-6">
                {activeTab === 'details' ? (
                  <div className="space-y-6">
                    <div className="flex flex-col text-[15px] md:text-[16px]">
                      {/* Row 1: Design Code */}
                      <div className="grid grid-cols-2 items-start gap-4 py-3.5 border-b border-outline-variant/30">
                        <span className="font-semibold text-on-surface-variant">Design Code</span>
                        <span className="text-on-surface font-semibold text-right break-all select-all">#DT-{design.id.slice(-8).toUpperCase()}</span>
                      </div>

                      {/* Row 2: Category */}
                      <div className="grid grid-cols-2 items-start gap-4 py-3.5 border-b border-outline-variant/30">
                        <span className="font-semibold text-on-surface-variant">Category</span>
                        <span className="text-on-surface font-semibold text-right break-words">{design.category}</span>
                      </div>

                      {/* Row 3: Subcategory */}
                      <div className="grid grid-cols-2 items-start gap-4 py-3.5 border-b border-outline-variant/30">
                        <span className="font-semibold text-on-surface-variant">Subcategory</span>
                        <span className="text-on-surface font-semibold text-right break-words">{design.subcategory || 'N/A'}</span>
                      </div>

                      {/* Row 4: Design Type */}
                      {design.category !== 'Digital Print Design' && design.category !== 'Position Print Design' && (
                        <div className="grid grid-cols-2 items-start gap-4 py-3.5 border-b border-outline-variant/30">
                          <span className="font-semibold text-on-surface-variant">Design Type</span>
                          <span className="text-on-surface font-semibold text-right break-words">{design.designType || 'N/A'}</span>
                        </div>
                      )}

                      {design.category === 'Digital Print Design' || design.category === 'Position Print Design' ? (
                        <>
                          {/* Row 5a: Height */}
                          <div className="grid grid-cols-2 items-start gap-4 py-3.5 border-b border-outline-variant/30">
                            <span className="font-semibold text-on-surface-variant">Height</span>
                            <span className="text-on-surface font-semibold text-right break-words">{design.height || 'N/A'}</span>
                          </div>

                          {/* Row 5b: Width */}
                          <div className="grid grid-cols-2 items-start gap-4 py-3.5 border-b border-outline-variant/30">
                            <span className="font-semibold text-on-surface-variant">Width</span>
                            <span className="text-on-surface font-semibold text-right break-words">{design.width || 'N/A'}</span>
                          </div>

                          {/* Row 6: Color */}
                          <div className="grid grid-cols-2 items-start gap-4 py-3.5 border-b border-outline-variant/30">
                            <span className="font-semibold text-on-surface-variant">Color</span>
                            <span className="text-on-surface font-semibold text-right break-words">{design.color || 'N/A'}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Row 5: Area / Reed */}
                          <div className="grid grid-cols-2 items-start gap-4 py-3.5 border-b border-outline-variant/30">
                            <span className="font-semibold text-on-surface-variant">
                              {design.category === 'Weaving Design' ? 'Reed' : 'Area'}
                            </span>
                            <span className="text-on-surface font-semibold text-right break-words">{design.area || 'N/A'}</span>
                          </div>

                          {/* Row 6: Needle / Pick */}
                          <div className="grid grid-cols-2 items-start gap-4 py-3.5 border-b border-outline-variant/30">
                            <span className="font-semibold text-on-surface-variant">
                              {design.category === 'Weaving Design' ? 'Pick' : 'Needle'}
                            </span>
                            <span className="text-on-surface font-semibold text-right break-words">{design.needle || 'N/A'}</span>
                          </div>
                        </>
                      )}

                      {/* Row 7: Design Format */}
                      <div className="grid grid-cols-2 items-start gap-4 py-3.5 border-b border-outline-variant/30">
                        <span className="font-semibold text-on-surface-variant">Design Format</span>
                        <span className="text-on-surface font-semibold text-right break-words uppercase">{design.designFormat || 'N/A'}</span>
                      </div>

                      {/* Row 8: Design Concept / Saree Concept */}
                      <div className="grid grid-cols-2 items-start gap-4 py-3.5 border-b border-outline-variant/30">
                        <span className="font-semibold text-on-surface-variant">
                          {design.category === 'Weaving Design' ? 'Design Concept' : 'Saree Concept'}
                        </span>
                        <span className="text-on-surface font-semibold text-right break-words">{design.sareeConcept || 'N/A'}</span>
                      </div>

                      {/* Row 9: Dimensions */}
                      <div className="grid grid-cols-2 items-start gap-4 py-3.5 border-b border-outline-variant/30">
                        <span className="font-semibold text-on-surface-variant">Dimensions</span>
                        <span className="text-on-surface font-semibold text-right break-words">{design.dimensions || 'N/A'}</span>
                      </div>

                      {/* Row 10: Colors */}
                      <div className="grid grid-cols-2 items-start gap-4 py-3.5 border-b border-outline-variant/30">
                        <span className="font-semibold text-on-surface-variant">Colors</span>
                        <span className="text-on-surface font-semibold text-right break-words">
                          {design.colorways && design.colorways.length > 0 ? design.colorways.join(', ') : 'N/A'}
                        </span>
                      </div>

                      {/* Row 11: Default License Scope */}
                      {design.category !== 'Digital Print Design' && design.category !== 'Position Print Design' && (
                        <div className="grid grid-cols-2 items-start gap-4 py-3.5">
                          <span className="font-semibold text-on-surface-variant">Default License Scope</span>
                          <span className="text-on-surface font-semibold text-right break-words">{design.licenseType || 'N/A'}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="mt-4 pt-4 border-t border-outline-variant/30">
                      <span className="font-bold text-on-surface-variant mb-2.5 text-[15px] md:text-[16px] block">
                        Tags
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {design.tags && design.tags.length > 0 ? (
                          design.tags.map(tag => (
                            <span key={tag} className="bg-surface-container px-2.5 py-1 rounded-md text-xs text-on-surface font-medium transition-colors hover:bg-primary-fixed/20 hover:text-primary">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-on-surface-variant italic">No tags available</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm md:text-[15px] text-on-surface-variant leading-relaxed">{design.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Image Modal */}
      {design && (
        <ImageLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={allImages.length > 0 ? allImages : [design.image]}
          currentIndex={activeImageIndex}
          onSelectImage={(idx) => {
            handleImageSelect(idx);
            setSelectedImageIndex(idx);
          }}
          onIndexChange={(idx) => {
            handleImageSelect(idx);
            setSelectedImageIndex(idx);
          }}
          title={design.title}
        />
      )}
    </div>
  );
}
