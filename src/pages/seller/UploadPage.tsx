import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';

export function UploadPage() {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Weaving Design');
  const [subcategory, setSubcategory] = useState('Saree Design');
  const [sareeType, setSareeType] = useState('Saree Design');
  const [lehenghaType, setLehenghaType] = useState('Lehengha Design');
  const [suitType, setSuitType] = useState('Suit Design');
  const [dupattaType, setDupattaType] = useState('Dupatta Design');
  const [mekhenaChadarType, setMekhenaChadarType] = useState('Mekhena + Chadar Design');
  const [multiType, setMultiType] = useState('Multi Design');
  const [sequinType, setSequinType] = useState('Sequin Design');
  const [cordingType, setCordingType] = useState('Cording Design');
  const [chainType, setChainType] = useState('Chain Design');
  const [beadsType, setBeadsType] = useState('Beads Design');
  const [ltcType, setLtcType] = useState('LTC Design');
  const [designType, setDesignType] = useState('2 fider design');
  const [area, setArea] = useState('');
  const [needle, setNeedle] = useState('');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [color, setColor] = useState('');
  const [designFormat, setDesignFormat] = useState('BMP');
  const [sareeConcept, setSareeConcept] = useState('jumbo design');
  const [price, setPrice] = useState('');
  const [pdcPrice, setPdcPrice] = useState('');
  const [tags, setTags] = useState('');
  const [dimensions, setDimensions] = useState('150cm width, repeat 30cm');
  const [colorways, setColorways] = useState('');
  const [licenseType, setLicenseType] = useState('Standard Regional');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [additionalPreviews, setAdditionalPreviews] = useState<(string | null)[]>([null, null, null, null]);
  const [zipFile, setZipFile] = useState<File | null>(null);
 
  // Dynamically update subcategory when category changes
  useEffect(() => {
    if (category === 'Weaving Design') {
      setSubcategory('Saree Design');
      setSareeType('Saree Design');
      setLehenghaType('Lehengha Design');
      setSuitType('Suit Design');
      setDupattaType('Dupatta Design');
      setMekhenaChadarType('Mekhena + Chadar Design');
      setDesignType('2 fider design');
      setArea('');
      setNeedle('');
      setHeight('');
      setWidth('');
      setColor('');
      setDesignFormat('BMP');
      setSareeConcept('jumbo design');
      setPdcPrice('');
    } else {
      if (category === 'Embroidery Design') {
        setSubcategory('Multi Design');
        setMultiType('Multi Design');
        setSequinType('Sequin Design');
        setCordingType('Cording Design');
        setChainType('Chain Design');
        setBeadsType('Beads Design');
        setLtcType('LTC Design');
      } else if (category === 'Digital Print Design') {
        setSubcategory('Allover Design');
      } else if (category === 'Position Print Design') {
        setSubcategory('Saree Design');
      } else {
        setSubcategory('Other');
      }
      setDesignType('Flat/Multi Designs');
      setArea('');
      setNeedle('');
      setHeight('');
      setWidth('');
      setColor('');
      if (category === 'Digital Print Design' || category === 'Position Print Design') {
        setDesignFormat('ALL');
      } else {
        setDesignFormat('EMB');
      }
      setSareeConcept('Box Pallu');
      setPdcPrice('');
    }
  }, [category]);

  const getSubcategories = () => {
    switch (category) {
      case 'Weaving Design':
        return [
          'Saree Design',
          'Lace Design',
          'Bulk Package Design',
          'All Over Design',
          'Suit Design',
          'Dupatta Design',
          'Blouse Design',
          'Lehengha Design',
          'Mekhena + Chadar Design',
          'Other'
        ];
      case 'Embroidery Design':
        return [
          'Multi Design',
          'Sequin Design',
          'Cording Design',
          'Chain Design',
          'Beads Design',
          'Folder Design',
          'Free Download',
          'Other'
        ];
      case 'Digital Print Design':
        return [
          'Allover Design',
          'Saree Design',
          'Dupatta Design',
          'Suit + Dupatta Set',
          'Kurti Design',
          'Sherwani Design',
          'Daman Design',
          'Tshirt Design',
          'Shirt Design',
          'Kaftan Design',
          'Pakistani Suit',
          'Lehenga Design',
          'Other'
        ];
      case 'Position Print Design':
        return [
          'Saree Design',
          'Dupatta Design',
          'Allover Design',
          'Blouse Design',
          'Kali + Lehenga Design',
          'Other'
        ];
      default:
        return ['Other'];
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFiles = [...additionalFiles];
      newFiles[index] = file;
      setAdditionalFiles(newFiles);

      const newPreviews = [...additionalPreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setAdditionalPreviews(newPreviews);
    }
  };

  const removeAdditionalFile = (index: number) => {
    const newFiles = [...additionalFiles];
    newFiles[index] = null;
    setAdditionalFiles(newFiles);

    const newPreviews = [...additionalPreviews];
    newPreviews[index] = null;
    setAdditionalPreviews(newPreviews);
  };

  const handleZipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'zip' && ext !== 'rar') {
        showToast('Please upload a ZIP or RAR archive file only', 'warning');
        return;
      }
      setZipFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !imageFile || !zipFile) {
      showToast('Please fill out all required fields, including both a display image and a ZIP/RAR design file', 'warning');
      return;
    }

    if (designFormat === 'PDC' && !pdcPrice) {
      showToast('Please specify the price for PDC format', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      
      let finalSubcategory = subcategory;
      if (category === 'Weaving Design') {
        if (subcategory === 'Saree Design') {
          finalSubcategory = sareeType;
        } else if (subcategory === 'Lehengha Design') {
          finalSubcategory = lehenghaType;
        } else if (subcategory === 'Suit Design') {
          finalSubcategory = suitType;
        } else if (subcategory === 'Dupatta Design') {
          finalSubcategory = dupattaType;
        } else if (subcategory === 'Mekhena + Chadar Design') {
          finalSubcategory = mekhenaChadarType;
        }
      } else if (category === 'Embroidery Design') {
        if (subcategory === 'Multi Design') {
          finalSubcategory = multiType;
        } else if (subcategory === 'Sequin Design') {
          finalSubcategory = sequinType;
        } else if (subcategory === 'Cording Design') {
          finalSubcategory = cordingType;
        } else if (subcategory === 'Chain Design') {
          finalSubcategory = chainType;
        } else if (subcategory === 'Beads Design') {
          finalSubcategory = beadsType;
        }
      }
      formData.append('subcategory', finalSubcategory);
      formData.append('price', price);
      formData.append('tags', tags);
      formData.append('dimensions', dimensions);
      formData.append('colorways', colorways);
      formData.append('licenseType', licenseType);
      formData.append('image', imageFile);
      additionalFiles.forEach((file) => {
        if (file) {
          formData.append('additionalImages', file);
        }
      });
      formData.append('designFile', zipFile);
      formData.append('designType', designType);
      if (category === 'Digital Print Design' || category === 'Position Print Design') {
        formData.append('height', height);
        formData.append('width', width);
        formData.append('color', color);
      } else {
        formData.append('area', area);
        formData.append('needle', needle);
      }
      formData.append('designFormat', designFormat);
      if (designFormat === 'PDC') {
        formData.append('pdcPrice', pdcPrice);
      }
      formData.append('sareeConcept', sareeConcept);

      await api.designs.create(formData);
      showToast('Design uploaded successfully! It is pending admin review.', 'success');
      navigate('/seller/designs');
    } catch (error: any) {
      console.error(error);
      showToast(error.response?.data?.error || 'Failed to upload design', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-1">Upload New Design</h2>
        <p className="text-sm text-on-surface-variant">Submit your textile design to the marketplace. Designs are reviewed by admins before activation.</p>
      </div>

      <div className="bg-white border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Design File / Pattern Image *</label>
            <div className="border-2 border-dashed border-outline-variant hover:border-primary/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center bg-surface/10 cursor-pointer relative min-h-[220px]">
              {imagePreview ? (
                <div className="text-center space-y-4">
                  <img src={imagePreview} alt="Preview" className="max-h-[180px] rounded-lg object-contain mx-auto shadow-sm" />
                  <p className="text-xs text-on-surface-variant font-medium">Click below to replace image</p>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <span className="material-symbols-outlined text-[48px] text-outline">upload_file</span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Drag & drop your file or browse</p>
                    <p className="text-xs text-on-surface-variant mt-1">Supports JPG, PNG, WEBP (Max 20MB)</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                required={!imagePreview}
              />
            </div>
          </div>

          {/* Additional Images Upload Area */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Additional Display Images (Up to 4)</label>
              <p className="text-xs text-on-surface-variant/80 mt-0.5">Add more views or colorways of the design to display to customers.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((index) => (
                <div 
                  key={index}
                  className="border-2 border-dashed border-outline-variant hover:border-primary/45 transition-colors rounded-xl bg-surface/10 relative h-28 flex flex-col items-center justify-center overflow-hidden group cursor-pointer"
                >
                  {additionalPreviews[index] ? (
                    <div className="absolute inset-0 w-full h-full">
                      <img 
                        src={additionalPreviews[index]!} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeAdditionalFile(index);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors z-10"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-2 flex flex-col items-center">
                      <span className="material-symbols-outlined text-[24px] text-outline mb-1">add_photo_alternate</span>
                      <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">Add Image</span>
                    </div>
                  )}
                  {!additionalPreviews[index] && (
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleAdditionalFileChange(index, e)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ZIP/RAR File Upload Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Design Source File (ZIP / RAR) *</label>
            <div className="border-2 border-dashed border-outline-variant hover:border-primary/50 transition-colors rounded-xl p-4 flex items-center justify-between bg-surface/10 cursor-pointer relative">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[32px] text-outline">archive</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-on-surface">
                    {zipFile ? zipFile.name : 'Select ZIP or RAR file'}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {zipFile ? `${(zipFile.size / 1024 / 1024).toFixed(2)} MB` : 'Supports ZIP, RAR (Max 50MB)'}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="text-xs font-bold text-primary hover:text-primary-dark uppercase px-3 py-1.5 border border-primary/20 rounded-lg bg-white animate-fade-in"
              >
                Browse
              </button>
              <input 
                type="file" 
                accept=".zip,.rar"
                onChange={handleZipFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                required={!zipFile}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Design Title *</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                placeholder="e.g. Geometric Navy Gold"
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Price (INR) *</label>
              <input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                placeholder="e.g. 500"
                min="0"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Category *</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
              >
                <option>Weaving Design</option>
                <option>Embroidery Design</option>
                <option>Digital Print Design</option>
                <option>Position Print Design</option>
              </select>
            </div>

            {/* Subcategory */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Subcategory *</label>
              <select 
                value={subcategory} 
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
              >
                {getSubcategories().map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Saree Type (Conditional) */}
            {category === 'Weaving Design' && subcategory === 'Saree Design' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Saree Type *</label>
                <select 
                  value={sareeType} 
                  onChange={(e) => setSareeType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
                >
                  <option value="Saree Design">General Saree Design</option>
                  <option value="Kota Lichi Design">Kota Lichi Design</option>
                  <option value="50 600 Design">50 600 Design</option>
                  <option value="Dolla-Nylon Design">Dolla-Nylon Design</option>
                  <option value="Viscouse Design">Viscouse Design</option>
                  <option value="(50 600) Satin Design">(50 600) Satin Design</option>
                  <option value="Nylon Satin Design">Nylon Satin Design</option>
                  <option value="Cotton Design">Cotton Design</option>
                  <option value="Dharmavarm Design">Dharmavarm Design</option>
                  <option value="Pattern Beam Design">Pattern Beam Design</option>
                  <option value="Mix Design">Mix Design</option>
                  <option value="Georgept (Crape) Design">Georgept (Crape) Design</option>
                </select>
              </div>
            )}

            {/* Lehengha Type (Conditional) */}
            {category === 'Weaving Design' && subcategory === 'Lehengha Design' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Lehengha Type *</label>
                <select 
                  value={lehenghaType} 
                  onChange={(e) => setLehenghaType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
                >
                  <option value="Lehengha Design">General Lehengha Design</option>
                  <option value="Lehengha - 50 600 Design">50 600 Design</option>
                  <option value="Lehengha - Kota Lichi Design">Kota Lichi Design</option>
                  <option value="Lehengha - Viscouse Design">Viscouse Design</option>
                  <option value="Lehengha - Nylon Satin Design">Nylon Satin Design</option>
                </select>
              </div>
            )}

            {/* Suit Type (Conditional) */}
            {category === 'Weaving Design' && subcategory === 'Suit Design' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Suit Type *</label>
                <select 
                  value={suitType} 
                  onChange={(e) => setSuitType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
                >
                  <option value="Suit Design">General Suit Design</option>
                  <option value="Suit - Kota Lichi Design">Kota Lichi Design</option>
                  <option value="Suit - Viscouse Design">Viscouse Design</option>
                  <option value="Suit - (50 600) Satin Design">(50 600) Satin Design</option>
                  <option value="Suit - Cotton Design">Cotton Design</option>
                </select>
              </div>
            )}

            {/* Dupatta Type (Conditional) */}
            {category === 'Weaving Design' && subcategory === 'Dupatta Design' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Dupatta Type *</label>
                <select 
                  value={dupattaType} 
                  onChange={(e) => setDupattaType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
                >
                  <option value="Dupatta Design">General Dupatta Design</option>
                  <option value="Dupatta - Kota Lichi Design">Kota Lichi Design</option>
                  <option value="Dupatta - 50 600 Design">50 600 Design</option>
                  <option value="Dupatta - Dolla-Nylon Design">Dolla-Nylon Design</option>
                  <option value="Dupatta - Viscouse Design">Viscouse Design</option>
                  <option value="Dupatta - (50 600) Satin Design">(50 600) Satin Design</option>
                  <option value="Dupatta - Nylon Satin Design">Nylon Satin Design</option>
                  <option value="Dupatta - Cotton Design">Cotton Design</option>
                </select>
              </div>
            )}

            {/* Mekhena + Chadar Type (Conditional) */}
            {category === 'Weaving Design' && subcategory === 'Mekhena + Chadar Design' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Mekhena + Chadar Type *</label>
                <select 
                  value={mekhenaChadarType} 
                  onChange={(e) => setMekhenaChadarType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
                >
                  <option value="Mekhena + Chadar Design">General Mekhena + Chadar Design</option>
                  <option value="Mekhena + Chadar - Kota Lichi Design">Kota Lichi Design</option>
                  <option value="Mekhena + Chadar - 50 600 Design">50 600 Design</option>
                  <option value="Mekhena + Chadar - Nylon Design">Nylon Design</option>
                  <option value="Mekhena + Chadar - Cotton Sprun Design">Cotton Sprun Design</option>
                </select>
              </div>
            )}
            {/* Multi Design Type (Conditional) */}
            {category === 'Embroidery Design' && subcategory === 'Multi Design' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Multi Design Type *</label>
                <select 
                  value={multiType} 
                  onChange={(e) => setMultiType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
                >
                  <option value="Multi Design">General Multi Design</option>
                  <option value="Saree Daman">Saree Daman</option>
                  <option value="C Pallu - Box Pallu">C Pallu - Box Pallu</option>
                  <option value="Gala-Nack-Single Head">Gala-Nack-Single Head</option>
                  <option value="Kurti-Gala">Kurti-Gala</option>
                  <option value="Buta">Buta</option>
                  <option value="Buti">Buti</option>
                  <option value="Sut Daman & Dupta">Sut Daman & Dupta</option>
                  <option value="Lace">Lace</option>
                  <option value="Figar">Figar</option>
                  <option value="Garment-Servani">Garment-Servani</option>
                  <option value="Penal-Pta">Penal-Pta</option>
                  <option value="Choli-Kli">Choli-Kli</option>
                  <option value="Blouse">Blouse</option>
                  <option value="Rajasthani-Kli">Rajasthani-Kli</option>
                  <option value="Lengha-Kli">Lengha-Kli</option>
                  <option value="Patli Daman">Patli Daman</option>
                  <option value="Cross Stitch">Cross Stitch</option>
                  <option value="Kasmiri Design">Kasmiri Design</option>
                  <option value="Jal">Jal</option>
                  <option value="Gamthi Design">Gamthi Design</option>
                </select>
              </div>
            )}

            {/* Sequin Design Type (Conditional) */}
            {category === 'Embroidery Design' && subcategory === 'Sequin Design' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Sequin Design Type *</label>
                <select 
                  value={sequinType} 
                  onChange={(e) => setSequinType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
                >
                  <option value="Sequin Design">General Sequin Design</option>
                  <option value="Dual-Sq">Dual-Sq</option>
                  <option value="Bhugali-Sq">Bhugali-Sq</option>
                  <option value="Garment & Servani">Garment & Servani</option>
                  <option value="Gala-Top & Tabla">Gala-Top & Tabla</option>
                  <option value="Daman">Daman</option>
                  <option value="Sut-Daman & Dupta">Sut-Daman & Dupta</option>
                  <option value="Choli & Blouse">Choli & Blouse</option>
                  <option value="Buta">Buta</option>
                  <option value="Buti Small">Buti Small</option>
                  <option value="Kli-Lengha">Kli-Lengha</option>
                  <option value="C Pallu">C Pallu</option>
                  <option value="Lace">Lace</option>
                  <option value="Figar Design">Figar Design</option>
                  <option value="No Panching">No Panching</option>
                </select>
              </div>
            )}

            {/* Cording Design Type (Conditional) */}
            {category === 'Embroidery Design' && subcategory === 'Cording Design' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cording Design Type *</label>
                <select 
                  value={cordingType} 
                  onChange={(e) => setCordingType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
                >
                  <option value="Cording Design">General Cording Design</option>
                  <option value="Lengha-Kli">Lengha-Kli</option>
                  <option value="Choli">Choli</option>
                  <option value="Gala & Servani">Gala & Servani</option>
                  <option value="Garment & Jal">Garment & Jal</option>
                  <option value="Daman">Daman</option>
                  <option value="Lace">Lace</option>
                  <option value="C Pallu">C Pallu</option>
                  <option value="Dual-Cording Sq">Dual-Cording Sq</option>
                  <option value="Figar Design">Figar Design</option>
                  <option value="Buta">Buta</option>
                  <option value="Blouse">Blouse</option>
                  <option value="Dupta-Only">Dupta-Only</option>
                  <option value="Buti">Buti</option>
                  <option value="No Panching">No Panching</option>
                </select>
              </div>
            )}

            {/* Chain Design Type (Conditional) */}
            {category === 'Embroidery Design' && subcategory === 'Chain Design' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Chain Design Type *</label>
                <select 
                  value={chainType} 
                  onChange={(e) => setChainType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
                >
                  <option value="Chain Design">General Chain Design</option>
                  <option value="Pallu-Scat">Pallu-Scat</option>
                  <option value="Patli & Kli">Patli & Kli</option>
                  <option value="Gala & Nack">Gala & Nack</option>
                  <option value="Garment & Jal">Garment & Jal</option>
                  <option value="Penal-Patta">Penal-Patta</option>
                  <option value="Figar Design">Figar Design</option>
                  <option value="Buta">Buta</option>
                  <option value="C Pallu">C Pallu</option>
                  <option value="Blouse">Blouse</option>
                  <option value="No Panching">No Panching</option>
                </select>
              </div>
            )}

            {/* Beads Design Type (Conditional) */}
            {category === 'Embroidery Design' && subcategory === 'Beads Design' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Beads Design Type *</label>
                <select 
                  value={beadsType} 
                  onChange={(e) => setBeadsType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
                >
                  <option value="Beads Design">General Beads Design</option>
                  <option value="Kli Beads Design">Kli Beads Design</option>
                  <option value="C-Pallu Beads Design">C-Pallu Beads Design</option>
                  <option value="Daman Beads Design">Daman Beads Design</option>
                  <option value="Gala beads Design">Gala beads Design</option>
                </select>
              </div>
            )}




            {/* Design Type (Machine Type) */}
            {category !== 'Digital Print Design' && category !== 'Position Print Design' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Design Type (Machine Type) *</label>
                <select 
                  value={designType} 
                  onChange={(e) => setDesignType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
                >
                  {category === 'Weaving Design' ? (
                    <>
                      <option value="2 fider design">2 fider design</option>
                      <option value="3 fider design">3 fider design</option>
                      <option value="4 fider design">4 fider design</option>
                      <option value="2688 design">2688 design</option>
                      <option value="5376 design(jumbo)">5376 design(jumbo)</option>
                      <option value="power loom design">power loom design</option>
                    </>
                  ) : (
                    <>
                      <option value="Flat/Multi Designs">Flat/Multi Designs</option>
                      <option value="Only Cording Designs">Only Cording Designs</option>
                      <option value="Only Sequin Designs">Only Sequin Designs</option>
                      <option value="Only Chain Stitch Designs">Only Chain Stitch Designs</option>
                      <option value="Multi+Cording Designs">Multi+Cording Designs</option>
                      <option value="Beads and Sequin Designs">Beads and Sequin Designs</option>
                      <option value="Multi+Cording+Sequin Designs">Multi+Cording+Sequin Designs</option>
                      <option value="Multi+Sequin Designs">Multi+Sequin Designs</option>
                      <option value="Multi+Chain Stitch Designs">Multi+Chain Stitch Designs</option>
                      <option value="Dual & Sandwich Sequin">Dual & Sandwich Sequin</option>
                      <option value="2/4/6 Sequin Design">2/4/6 Sequin Design</option>
                      <option value="Cording + Sequin Designs">Cording + Sequin Designs</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {category === 'Digital Print Design' || category === 'Position Print Design' ? (
              <>
                {/* Height */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Height *</label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 30 inch or 150 cm"
                    className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                    required
                  />
                </div>

                {/* Width */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Width *</label>
                  <input
                    type="text"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="e.g. 44 inch or 110 cm"
                    className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                    required
                  />
                </div>

                {/* Color */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Color *</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Multi Color or 4 Color"
                    className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                {/* Area */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    {category === 'Weaving Design' ? 'Reed *' : 'Area *'}
                  </label>
                  {category === 'Weaving Design' ? (
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. 100 to 110"
                      className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                      required
                    />
                  ) : (
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. 150 mm"
                      className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                      required
                    />
                  )}
                </div>

                {/* Needle / Pick */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    {category === 'Weaving Design' ? 'Pick *' : 'Needle *'}
                  </label>
                  {category === 'Weaving Design' ? (
                    <input
                      type="text"
                      value={needle}
                      onChange={(e) => setNeedle(e.target.value)}
                      placeholder="e.g. 36 to 42"
                      className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                      required
                    />
                  ) : (
                    <input
                      type="text"
                      value={needle}
                      onChange={(e) => setNeedle(e.target.value)}
                      placeholder="e.g. 9 Color"
                      className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                      required
                    />
                  )}
                </div>
              </>
            )}

            {/* Design Format */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Design Format *</label>
              <select 
                value={designFormat} 
                onChange={(e) => {
                  setDesignFormat(e.target.value);
                  if (e.target.value !== 'PDC') setPdcPrice('');
                }}
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
              >
                {category === 'Weaving Design' ? (
                  <>
                    <option value="BMP">BMP</option>
                    <option value="PDC">PDC</option>
                  </>
                ) : category === 'Digital Print Design' || category === 'Position Print Design' ? (
                  <>
                    <option value="ALL">ALL</option>
                    <option value="PSD">PSD</option>
                    <option value="TIF">TIF</option>
                  </>
                ) : (
                  <>
                    <option value="EMB">EMB</option>
                    <option value="DST">DST</option>
                    <option value="JEF">JEF</option>
                    <option value="PES">PES</option>
                    <option value="DHP">DHP</option>
                    <option value="VIP">VIP</option>
                    <option value="PEC">PEC</option>
                    <option value="VP3">VP3</option>
                    <option value="XXX">XXX</option>
                    <option value="HUS">HUS</option>
                    <option value="SEW">SEW</option>
                  </>
                )}
              </select>
            </div>

            {/* PDC Price */}
            {designFormat === 'PDC' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">PDC Price (INR) *</label>
                <input 
                  type="number" 
                  value={pdcPrice} 
                  onChange={(e) => setPdcPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                  placeholder="e.g. 1250"
                  min="0"
                  required
                />
              </div>
            )}

            {/* Saree Concept / Design Concept */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {category === 'Weaving Design' ? 'Design Concept *' : 'Saree Concept *'}
              </label>
              <select 
                value={sareeConcept} 
                onChange={(e) => setSareeConcept(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
              >
                {category === 'Weaving Design' ? (
                  <>
                    <option value="jumbo design">jumbo design</option>
                    <option value="box pallu">box pallu</option>
                    <option value="c-pallu">c-pallu</option>
                    <option value="pushmeena">pushmeena</option>
                    <option value="satin">satin</option>
                    <option value="peithani">peithani</option>
                    <option value="butt + butti + leriya">butt + butti + leriya</option>
                    <option value="cotton">cotton</option>
                    <option value="georget">georget</option>
                    <option value="topdyed">topdyed</option>
                    <option value="nylon">nylon</option>
                  </>
                ) : (
                  <>
                    <option value="Box Pallu">Box Pallu</option>
                    <option value="C Pallu">C Pallu</option>
                    <option value="Figure">Figure</option>
                    <option value="Ton to Ton">Ton to Ton</option>
                    <option value="Dhaga Test">Dhaga Test</option>
                    <option value="Cut-Peast">Cut-Peast</option>
                    <option value="Diamond test">Diamond test</option>
                    <option value="Single jari">Single jari</option>
                    <option value="Cut Work">Cut Work</option>
                    <option value="Form">Form</option>
                    <option value="Patli Pallu">Patli Pallu</option>
                    <option value="Half-Half">Half-Half</option>
                    <option value="Jaal">Jaal</option>
                    <option value="Kalkatti Test">Kalkatti Test</option>
                    <option value="Marun Test">Marun Test</option>
                    <option value="Panel">Panel</option>
                    <option value="Butta Saree">Butta Saree</option>
                    <option value="Daman">Daman</option>
                    <option value="Kashmiri Test">Kashmiri Test</option>
                    <option value="Packing">Packing</option>
                    <option value="South Test">South Test</option>
                    <option value="Lace Butta">Lace Butta</option>
                  </>
                )}
              </select>
            </div>

            {/* Dimensions */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Dimensions / Repeat pattern</label>
              <input 
                type="text" 
                value={dimensions} 
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                placeholder="e.g. 150cm width, repeat 30cm"
              />
            </div>

            {/* License Type */}
            {category !== 'Digital Print Design' && category !== 'Position Print Design' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Default License Scope</label>
                <select 
                  value={licenseType} 
                  onChange={(e) => setLicenseType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
                >
                  <option value="Open Regional">Open Regional</option>
                  <option value="Standard Regional">Standard Regional</option>
                  <option value="Exclusive Global">Exclusive Global</option>
                </select>
              </div>
            )}

            {/* Colorways */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Colorways (comma-separated)</label>
              <input 
                type="text" 
                value={colorways} 
                onChange={(e) => setColorways(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                placeholder="e.g. Navy/Gold, Forest/Copper"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tags (comma-separated)</label>
              <input 
                type="text" 
                value={tags} 
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
                placeholder="e.g. geometric, corporate, navy"
              />
            </div>

          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest"
              placeholder="Describe the design structure, colors, fabric drape and style..."
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/30">
            <button 
              type="button" 
              onClick={() => navigate('/seller/designs')}
              className="px-5 py-2.5 border border-outline-variant rounded-lg text-sm font-semibold hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading to Cloudinary...
                </>
              ) : 'Submit Design'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
