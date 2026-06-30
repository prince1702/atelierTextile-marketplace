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
  const [subcategory, setSubcategory] = useState('Kotalichi Design');
  const [fabric, setFabric] = useState('Cotton Blend');
  const [price, setPrice] = useState('');
  const [tags, setTags] = useState('');
  const [dimensions, setDimensions] = useState('150cm width, repeat 30cm');
  const [colorways, setColorways] = useState('');
  const [licenseType, setLicenseType] = useState('Standard Regional');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Dynamically update subcategory when category changes
  useEffect(() => {
    if (category === 'Weaving Design') {
      setSubcategory('Kotalichi Design');
    } else if (category === 'Embroidery Design') {
      setSubcategory('Multi Design');
    } else if (category === 'Digital Print Design') {
      setSubcategory('Allover Design');
    } else if (category === 'Position Print Design') {
      setSubcategory('Saree Design');
    } else {
      setSubcategory('Other');
    }
  }, [category]);

  const getSubcategories = () => {
    switch (category) {
      case 'Weaving Design':
        return [
          'Kotalichi Design',
          '50 600 Design',
          'Nylon Design',
          'Satin Design',
          'Cotton Design',
          'All Over Design',
          'Suit Design',
          'Dupatta Design',
          'Blouse Design',
          'Lehengha Design',
          'Lace Design'
        ];
      case 'Embroidery Design':
        return [
          'Multi Design',
          'Sequin Design',
          'Cording Design',
          'Chain Design',
          'Beads Design',
          'Folder Design',
          'LTC Design',
          'Free Download'
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
          'Other Design'
        ];
      case 'Position Print Design':
        return [
          'Saree Design',
          'Dupatta Design',
          'Allover Design',
          'Blouse Design',
          'Kali + Lehenga Design'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !imageFile) {
      showToast('Please fill out all required fields and upload an image', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('subcategory', subcategory);
      formData.append('fabric', fabric);
      formData.append('price', price);
      formData.append('tags', tags);
      formData.append('dimensions', dimensions);
      formData.append('colorways', colorways);
      formData.append('licenseType', licenseType);
      formData.append('image', imageFile);

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
                    <p className="text-xs text-on-surface-variant mt-1">Supports JPG, PNG, WEBP (Max 5MB)</p>
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
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Price (USD) *</label>
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

            {/* Fabric */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Recommended Fabric *</label>
              <select 
                value={fabric} 
                onChange={(e) => setFabric(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-sm bg-surface-container-lowest cursor-pointer"
              >
                <option>Cotton Blend</option>
                <option>Silk</option>
                <option>Linen</option>
                <option>Polyester Blend</option>
                <option>Wool Blend</option>
                <option>Cotton Sateen</option>
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
