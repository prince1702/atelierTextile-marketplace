const Design = require('../models/Design');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer, resourceType = 'image', originalName = '') => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: 'atelierTextile/designs',
      resource_type: resourceType,
    };
    if (resourceType === 'raw') {
      options.type = 'authenticated';
    }

    if (resourceType === 'raw' && originalName) {
      const ext = path.extname(originalName);
      const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');
      options.public_id = `${base}-${Date.now()}${ext}`;
    }

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const parseRangeNumbers = (str) => {
  if (!str) return { min: null, max: null };
  const matches = String(str).match(/\d+/g);
  if (!matches || matches.length === 0) return { min: null, max: null };
  const nums = matches.map(Number);
  const min = nums[0];
  const max = nums.length > 1 ? nums[1] : nums[0];
  return { min, max };
};

// @desc    Get all active designs (public, with filters & pagination)
// @route   GET /api/designs
// @access  Public
exports.getDesigns = async (req, res, next) => {
  try {
    const {
      category,
      subcategory,
      minPrice,
      maxPrice,
      search,
      badge,
      sort,
      page = 1,
      limit = 12,
      designType,
      area,
      needle,
      designFormat,
      sareeConcept,
    } = req.query;

    let filterStatus = 'active';
    if (req.query.status) {
      if (req.query.status === 'active') {
        filterStatus = 'active';
      } else {
        // Require admin authentication for non-active statuses
        try {
          const jwt = require('jsonwebtoken');
          let token;
          if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (user && user.role === 'admin') {
              filterStatus = req.query.status;
            }
          }
        } catch (err) {
          filterStatus = 'active';
        }
      }
    }

    const filter = {};
    if (filterStatus !== 'all') {
      filter.status = filterStatus;
    }

    if (category) filter.category = category;
    if (subcategory) {
      if (subcategory === 'Saree Design') {
        filter.subcategory = { 
          $in: [
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
          ] 
        };
      } else if (subcategory === 'Lehengha Design') {
        filter.subcategory = {
          $in: [
            'Lehengha Design',
            'Lehengha - 50 600 Design',
            'Lehengha - Kota Lichi Design',
            'Lehengha - Viscouse Design',
            'Lehengha - Nylon Satin Design'
          ]
        };
      } else if (subcategory === 'Suit Design') {
        filter.subcategory = {
          $in: [
            'Suit Design',
            'Suit - Kota Lichi Design',
            'Suit - Viscouse Design',
            'Suit - (50 600) Satin Design',
            'Suit - Cotton Design'
          ]
        };
      } else if (subcategory === 'Dupatta Design') {
        filter.subcategory = {
          $in: [
            'Dupatta Design',
            'Dupatta - Kota Lichi Design',
            'Dupatta - 50 600 Design',
            'Dupatta - Dolla-Nylon Design',
            'Dupatta - Viscouse Design',
            'Dupatta - (50 600) Satin Design',
            'Dupatta - Nylon Satin Design',
            'Dupatta - Cotton Design'
          ]
        };
      } else if (subcategory === 'Mekhena + Chadar Design') {
        filter.subcategory = {
          $in: [
            'Mekhena + Chadar Design',
            'Mekhena + Chadar - Kota Lichi Design',
            'Mekhena + Chadar - 50 600 Design',
            'Mekhena + Chadar - Nylon Design',
            'Mekhena + Chadar - Cotton Sprun Design'
          ]
        };
      } else if (subcategory === 'Multi Design') {
        filter.subcategory = {
          $in: [
            'Multi Design',
            'Saree Daman',
            'C Pallu - Box Pallu',
            'Gala-Nack-Single Head',
            'Kurti-Gala',
            'Buta',
            'Buti',
            'Sut Daman & Dupta',
            'Lace',
            'Figar',
            'Garment-Servani',
            'Penal-Pta',
            'Choli-Kli',
            'Blouse',
            'Rajasthani-Kli',
            'Lengha-Kli',
            'Patli Daman',
            'Cross Stitch',
            'Kasmiri Design',
            'Jal',
            'Gamthi Design'
          ]
        };
      } else if (subcategory === 'Sequin Design') {
        filter.subcategory = {
          $in: [
            'Sequin Design',
            'Dual-Sq',
            'Bhugali-Sq',
            'Garment & Servani',
            'Gala-Top & Tabla',
            'Daman',
            'Sut-Daman & Dupta',
            'Choli & Blouse',
            'Buta',
            'Buti Small',
            'Kli-Lengha',
            'C Pallu',
            'Lace',
            'Figar Design',
            'No Panching'
          ]
        };
      } else if (subcategory === 'Cording Design') {
        filter.subcategory = {
          $in: [
            'Cording Design',
            'Lengha-Kli',
            'Choli',
            'Gala & Servani',
            'Garment & Jal',
            'Daman',
            'Lace',
            'C Pallu',
            'Dual-Cording Sq',
            'Figar Design',
            'Buta',
            'Blouse',
            'Dupta-Only',
            'Buti',
            'No Panching'
          ]
        };
      } else if (subcategory === 'Chain Design') {
        filter.subcategory = {
          $in: [
            'Chain Design',
            'Pallu-Scat',
            'Patli & Kli',
            'Gala & Nack',
            'Garment & Jal',
            'Penal-Patta',
            'Figar Design',
            'Buta',
            'C Pallu',
            'Blouse',
            'No Panching'
          ]
        };
      } else if (subcategory === 'Beads Design') {
        filter.subcategory = {
          $in: [
            'Beads Design',
            'Kli Beads Design',
            'C-Pallu Beads Design',
            'Daman Beads Design',
            'Gala beads Design'
          ]
        };
      } else if (subcategory === 'LTC Design') {
        filter.subcategory = {
          $in: [
            'LTC Design',
            'Sequience',
            'Daman',
            'Patli',
            'C Pallu',
            'Figar Design',
            'Garment & Jal',
            'Buta',
            'Sut',
            'Cording Design',
            'Gala-Neck'
          ]
        };
      } else {
        filter.subcategory = subcategory;
      }
    }
    if (badge) filter.badge = badge;
    if (designType) filter.designType = designType;
    if (area) {
      const { min: fMin, max: fMax } = parseRangeNumbers(area);
      if (fMin !== null && fMax !== null) {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { areaMin: { $lte: fMax }, areaMax: { $gte: fMin } },
            { area: area }
          ]
        });
      } else {
        filter.area = area;
      }
    }

    if (needle) {
      const { min: fMin, max: fMax } = parseRangeNumbers(needle);
      if (fMin !== null && fMax !== null) {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { needleMin: { $lte: fMax }, needleMax: { $gte: fMin } },
            { needle: needle }
          ]
        });
      } else {
        filter.needle = needle;
      }
    }
    if (designFormat) filter.designFormat = designFormat;
    if (sareeConcept) filter.sareeConcept = sareeConcept;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { designerName: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [designs, total] = await Promise.all([
      Design.find(filter).sort(sortOption).skip(skip).limit(limitNum),
      Design.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: designs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: designs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single design by ID
// @route   GET /api/designs/:id
// @access  Public
exports.getDesign = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id).populate(
      'designer',
      'name initials avatar'
    );

    if (!design) {
      return res.status(404).json({
        success: false,
        error: 'Design not found',
      });
    }

    res.status(200).json({
      success: true,
      data: design,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get designs by category
// @route   GET /api/designs/category/:category
// @access  Public
exports.getDesignsByCategory = async (req, res, next) => {
  try {
    const designs = await Design.find({
      category: req.params.category,
      status: 'active',
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: designs.length,
      data: designs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new design
// @route   POST /api/designs
// @access  Seller only
exports.createDesign = async (req, res, next) => {
  try {
    const seller = await User.findById(req.user.id);
    if (!seller) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const imageFile = req.files && req.files['image'] ? req.files['image'][0] : null;
    const designFile = req.files && req.files['designFile'] ? req.files['designFile'][0] : null;
    const pdcDesignFile = req.files && req.files['pdcDesignFile'] ? req.files['pdcDesignFile'][0] : null;
    const additionalImageFiles = req.files && req.files['additionalImages'] ? req.files['additionalImages'] : [];

    let imageUrl = '';
    let designFileUrl = '';
    let pdcDesignFileUrl = '';
    const additionalImageUrls = [];

    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                   process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
                                   process.env.CLOUDINARY_API_KEY && 
                                   process.env.CLOUDINARY_API_KEY !== 'your_api_key';

    // 1. Process display image
    if (imageFile) {
      let uploadSuccess = false;
      if (isCloudinaryConfigured) {
        try {
          const result = await uploadToCloudinary(imageFile.buffer, 'image');
          imageUrl = result.secure_url;
          uploadSuccess = true;
        } catch (cloudinaryError) {
          console.warn('⚠️ Cloudinary upload failed, using local fallback:', cloudinaryError.message);
        }
      }

      if (!uploadSuccess) {
        try {
          const uploadsDir = path.join(__dirname, '../public/uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const filename = `design-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(imageFile.originalname) || '.jpg'}`;
          const filePath = path.join(uploadsDir, filename);
          fs.writeFileSync(filePath, imageFile.buffer);
          
          // Resolve backend URL dynamically
          const host = req.get('host');
          imageUrl = `${req.protocol}://${host}/uploads/${filename}`;
        } catch (localError) {
          console.error('❌ Local file write failed:', localError);
          imageUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500'; // Final fallback
        }
      }
    } else {
      imageUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500';
    }

    // 1b. Process additional display images
    if (additionalImageFiles.length > 0) {
      for (const file of additionalImageFiles) {
        let uploadSuccess = false;
        let additionalUrl = '';
        if (isCloudinaryConfigured) {
          try {
            const result = await uploadToCloudinary(file.buffer, 'image');
            additionalUrl = result.secure_url;
            uploadSuccess = true;
          } catch (cloudinaryError) {
            console.warn('⚠️ Cloudinary upload failed for additional image, using local fallback:', cloudinaryError.message);
          }
        }

        if (!uploadSuccess) {
          try {
            const uploadsDir = path.join(__dirname, '../public/uploads');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const filename = `design-add-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname) || '.jpg'}`;
            const filePath = path.join(uploadsDir, filename);
            fs.writeFileSync(filePath, file.buffer);
            
            const host = req.get('host');
            additionalUrl = `${req.protocol}://${host}/uploads/${filename}`;
          } catch (localError) {
            console.error('❌ Local additional image write failed:', localError);
            additionalUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500';
          }
        }
        additionalImageUrls.push(additionalUrl);
      }
    }

    // 2. Process design source file (ZIP/RAR)
    if (designFile) {
      let uploadSuccess = false;
      if (isCloudinaryConfigured) {
        try {
          const result = await uploadToCloudinary(designFile.buffer, 'raw', designFile.originalname);
          designFileUrl = result.secure_url;
          uploadSuccess = true;
        } catch (cloudinaryError) {
          console.warn('⚠️ Cloudinary raw file upload failed, using local fallback:', cloudinaryError.message);
        }
      }

      if (!uploadSuccess) {
        try {
          const uploadsDir = path.join(__dirname, '../public/uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const filename = `designFile-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(designFile.originalname) || '.zip'}`;
          const filePath = path.join(uploadsDir, filename);
          fs.writeFileSync(filePath, designFile.buffer);
          
          // Resolve backend URL dynamically
          const host = req.get('host');
          designFileUrl = `${req.protocol}://${host}/uploads/${filename}`;
        } catch (localError) {
          console.error('❌ Local design file write failed:', localError);
        }
      }
    }

    // 3. Process PDC design source file (ZIP/RAR/PDC) if uploaded
    if (pdcDesignFile) {
      let uploadSuccess = false;
      if (isCloudinaryConfigured) {
        try {
          const result = await uploadToCloudinary(pdcDesignFile.buffer, 'raw', pdcDesignFile.originalname);
          pdcDesignFileUrl = result.secure_url;
          uploadSuccess = true;
        } catch (cloudinaryError) {
          console.warn('⚠️ Cloudinary raw pdc file upload failed, using local fallback:', cloudinaryError.message);
        }
      }

      if (!uploadSuccess) {
        try {
          const uploadsDir = path.join(__dirname, '../public/uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const filename = `pdcDesignFile-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(pdcDesignFile.originalname) || '.zip'}`;
          const filePath = path.join(uploadsDir, filename);
          fs.writeFileSync(filePath, pdcDesignFile.buffer);
          
          const host = req.get('host');
          pdcDesignFileUrl = `${req.protocol}://${host}/uploads/${filename}`;
        } catch (localError) {
          console.error('❌ Local PDC design file write failed:', localError);
        }
      }
    }

    const areaRange = parseRangeNumbers(req.body.area);
    const needleRange = parseRangeNumbers(req.body.needle);

    console.log('📥 createDesign req.body keys:', Object.keys(req.body), '| image:', imageFile?.originalname, '| designFile:', designFile?.originalname, '| pdcDesignFile:', pdcDesignFile?.originalname);
    const design = await Design.create({
      ...req.body,
      areaMin: areaRange.min,
      areaMax: areaRange.max,
      needleMin: needleRange.min,
      needleMax: needleRange.max,
      designFile: designFileUrl || req.body.designFile || '',
      pdcDesignFile: pdcDesignFileUrl || req.body.pdcDesignFile || '',

      tags: req.body.tags
        ? typeof req.body.tags === 'string'
          ? req.body.tags.split(',').map((t) => t.trim())
          : req.body.tags
        : [],
      colorways: req.body.colorways
        ? typeof req.body.colorways === 'string'
          ? req.body.colorways.split(',').map((c) => c.trim())
          : req.body.colorways
        : [],
      designer: req.user.id,
      designerName: seller.name,
      designerAvatar: seller.initials,
      image: imageUrl,
      additionalImages: additionalImageUrls,
      designFile: designFileUrl,
      status: 'pending', // Admin must approve
    });

    res.status(201).json({
      success: true,
      data: design,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a design
// @route   PUT /api/designs/:id
// @access  Seller (own design only)
exports.updateDesign = async (req, res, next) => {
  try {
    let design = await Design.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ success: false, error: 'Design not found' });
    }

    // Check ownership
    if (design.designer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own designs',
      });
    }

    const imageFile = req.files && req.files['image'] ? req.files['image'][0] : null;
    const designFile = req.files && req.files['designFile'] ? req.files['designFile'][0] : null;
    const pdcDesignFile = req.files && req.files['pdcDesignFile'] ? req.files['pdcDesignFile'][0] : null;
    const additionalImageFiles = req.files && req.files['additionalImages'] ? req.files['additionalImages'] : [];

    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                   process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
                                   process.env.CLOUDINARY_API_KEY && 
                                   process.env.CLOUDINARY_API_KEY !== 'your_api_key';

    // Upload new image if provided
    if (imageFile) {
      let uploadSuccess = false;
      if (isCloudinaryConfigured) {
        try {
          const result = await uploadToCloudinary(imageFile.buffer, 'image');
          req.body.image = result.secure_url;
          uploadSuccess = true;
        } catch (cloudinaryError) {
          console.warn('⚠️ Cloudinary upload failed during edit, using local fallback:', cloudinaryError.message);
        }
      }

      if (!uploadSuccess) {
        try {
          const uploadsDir = path.join(__dirname, '../public/uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const filename = `design-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(imageFile.originalname) || '.jpg'}`;
          const filePath = path.join(uploadsDir, filename);
          fs.writeFileSync(filePath, imageFile.buffer);
          
          // Resolve backend URL dynamically
          const host = req.get('host');
          req.body.image = `${req.protocol}://${host}/uploads/${filename}`;
        } catch (localError) {
          console.error('❌ Local file write failed during edit:', localError);
        }
      }
    }

    // Upload new designFile if provided
    if (designFile) {
      let uploadSuccess = false;
      if (isCloudinaryConfigured) {
        try {
          const result = await uploadToCloudinary(designFile.buffer, 'raw', designFile.originalname);
          req.body.designFile = result.secure_url;
          uploadSuccess = true;
        } catch (cloudinaryError) {
          console.warn('⚠️ Cloudinary raw upload failed during edit, using local fallback:', cloudinaryError.message);
        }
      }

      if (!uploadSuccess) {
        try {
          const uploadsDir = path.join(__dirname, '../public/uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const filename = `designFile-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(designFile.originalname) || '.zip'}`;
          const filePath = path.join(uploadsDir, filename);
          fs.writeFileSync(filePath, designFile.buffer);
          
          // Resolve backend URL dynamically
          const host = req.get('host');
          req.body.designFile = `${req.protocol}://${host}/uploads/${filename}`;
        } catch (localError) {
          console.error('❌ Local design file write failed during edit:', localError);
        }
      }
    }

    // Upload new pdcDesignFile if provided
    if (pdcDesignFile) {
      let uploadSuccess = false;
      if (isCloudinaryConfigured) {
        try {
          const result = await uploadToCloudinary(pdcDesignFile.buffer, 'raw', pdcDesignFile.originalname);
          req.body.pdcDesignFile = result.secure_url;
          uploadSuccess = true;
        } catch (cloudinaryError) {
          console.warn('⚠️ Cloudinary raw pdc upload failed during edit, using local fallback:', cloudinaryError.message);
        }
      }

      if (!uploadSuccess) {
        try {
          const uploadsDir = path.join(__dirname, '../public/uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const filename = `pdcDesignFile-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(pdcDesignFile.originalname) || '.zip'}`;
          const filePath = path.join(uploadsDir, filename);
          fs.writeFileSync(filePath, pdcDesignFile.buffer);
          
          const host = req.get('host');
          req.body.pdcDesignFile = `${req.protocol}://${host}/uploads/${filename}`;
        } catch (localError) {
          console.error('❌ Local PDC design file write failed during edit:', localError);
        }
      }
    }

    // Upload new additional images if provided
    if (additionalImageFiles.length > 0) {
      const additionalImageUrls = [];
      for (const file of additionalImageFiles) {
        let uploadSuccess = false;
        let additionalUrl = '';
        if (isCloudinaryConfigured) {
          try {
            const result = await uploadToCloudinary(file.buffer, 'image');
            additionalUrl = result.secure_url;
            uploadSuccess = true;
          } catch (cloudinaryError) {
            console.warn('⚠️ Cloudinary upload failed for additional image during edit, using local fallback:', cloudinaryError.message);
          }
        }

        if (!uploadSuccess) {
          try {
            const uploadsDir = path.join(__dirname, '../public/uploads');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const filename = `design-add-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname) || '.jpg'}`;
            const filePath = path.join(uploadsDir, filename);
            fs.writeFileSync(filePath, file.buffer);
            
            const host = req.get('host');
            additionalUrl = `${req.protocol}://${host}/uploads/${filename}`;
          } catch (localError) {
            console.error('❌ Local additional image write failed during edit:', localError);
            additionalUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500';
          }
        }
        additionalImageUrls.push(additionalUrl);
      }
      req.body.additionalImages = additionalImageUrls;
    }

    // Parse array fields if sent as strings
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map((t) => t.trim());
    }
    if (req.body.colorways && typeof req.body.colorways === 'string') {
      req.body.colorways = req.body.colorways.split(',').map((c) => c.trim());
    }
    if (req.body.additionalImages && typeof req.body.additionalImages === 'string') {
      try {
        req.body.additionalImages = JSON.parse(req.body.additionalImages);
      } catch (err) {
        req.body.additionalImages = req.body.additionalImages.split(',').map((t) => t.trim());
      }
    }

    if (req.body.area !== undefined) {
      const areaRange = parseRangeNumbers(req.body.area);
      req.body.areaMin = areaRange.min;
      req.body.areaMax = areaRange.max;
    }

    if (req.body.needle !== undefined) {
      const needleRange = parseRangeNumbers(req.body.needle);
      req.body.needleMin = needleRange.min;
      req.body.needleMax = needleRange.max;
    }

    design = await Design.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: design,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a design
// @route   DELETE /api/designs/:id
// @access  Seller (own) or Admin
exports.deleteDesign = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ success: false, error: 'Design not found' });
    }

    // Allow admin or the owning seller
    if (
      req.user.role !== 'admin' &&
      design.designer.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own designs',
      });
    }

    await Design.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller's own designs (includes pending/rejected)
// @route   GET /api/designs/my/listings
// @access  Seller only
exports.getMyListings = async (req, res, next) => {
  try {
    const designs = await Design.find({ designer: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: designs.length,
      data: designs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a design
// @route   PATCH /api/designs/:id/status
// @access  Admin only
exports.updateDesignStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be active, pending, or rejected',
      });
    }

    const design = await Design.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!design) {
      return res.status(404).json({ success: false, error: 'Design not found' });
    }

    res.status(200).json({
      success: true,
      data: design,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download secure design file
// @route   GET /api/designs/:id/download
// @access  Authenticated (buyer/seller/admin)
exports.downloadDesign = async (req, res, next) => {
  try {
    const Order = require('../models/Order');
    const design = await Design.findById(req.params.id);
    if (!design) {
      return res.status(404).json({ success: false, error: 'Design not found' });
    }

    // Check permissions: admin, owner, or purchaser
    const isOwner = design.designer.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';
    const hasPurchased = await Order.exists({
      buyer: req.user.id,
      design: design._id,
      status: 'completed',
    });

    if (!isOwner && !isAdmin && !hasPurchased) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to download this design file',
      });
    }

    // Determine which file to download based on query parameter `fileType` (or `type`)
    const requestedType = (req.query.fileType || req.query.type || '').toLowerCase();
    let fileUrl = design.designFile;

    if (requestedType === 'pdc' || requestedType === 'tif' || requestedType === 'optional') {
      if (!design.pdcDesignFile || design.pdcDesignFile.trim() === '') {
        return res.status(404).json({
          success: false,
          error: 'Optional PDC/TIF design file is not available for this design.',
        });
      }
      fileUrl = design.pdcDesignFile;
    }

    if (!fileUrl || fileUrl.trim() === '') {
      return res.status(404).json({
        success: false,
        error: 'No downloadable file has been uploaded for this design yet. Please ask the seller to upload a ZIP/RAR source file.',
      });
    }

    const safeTitle = design.title.replace(/[^a-zA-Z0-9]/g, '_');

    console.log(`📥 downloadDesign: id=${req.params.id} fileUrl="${fileUrl}"`);

    // Detect expired Render local-storage URLs (e.g. https://ateliertextile-backend.onrender.com/uploads/...)
    // These files are gone because Render uses ephemeral disks
    const isExpiredRenderUrl = fileUrl.includes('/uploads/') && fileUrl.includes('onrender.com');
    if (isExpiredRenderUrl) {
      return res.status(410).json({
        success: false,
        error: 'This design file was uploaded to a temporary server and has since been deleted. Please ask the seller to re-upload the ZIP/RAR source file.',
      });
    }

    // ── Check 1: Is file located in local /uploads/ directory? ──────────────
    if (fileUrl.includes('/uploads/')) {
      try {
        const urlObj = new URL(fileUrl, 'http://localhost:5000');
        const filename = path.basename(urlObj.pathname);
        const filePath = path.join(__dirname, '../public/uploads', filename);

        if (fs.existsSync(filePath)) {
          const ext = path.extname(filename) || '.zip';
          return res.download(filePath, `${safeTitle}${ext}`);
        }
      } catch (e) {
        console.warn('⚠️ Path parse error for local file:', e.message);
      }
    }

    // ── Check 2: Direct HTTP/HTTPS file (Cloudinary or Remote URL) ──────────
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      const https = require('https');
      const http = require('http');

      let ext = '.zip';
      try {
        ext = path.extname(new URL(fileUrl).pathname) || '.zip';
      } catch (e) {}

      const downloadFilename = `${safeTitle}${ext}`;

      const streamDirectUrl = (targetUrl, dlName) => {
        const streamFrom = (url, redirectsLeft) => {
          if (redirectsLeft < 0) {
            if (!res.headersSent) res.status(502).json({ success: false, error: 'Too many redirects from storage server.' });
            return;
          }
          const proto = url.startsWith('https') ? https : http;
          proto.get(url, (remoteRes) => {
            if (remoteRes.statusCode === 301 || remoteRes.statusCode === 302 || remoteRes.statusCode === 307 || remoteRes.statusCode === 308) {
              streamFrom(remoteRes.headers.location, redirectsLeft - 1);
              return;
            }
            if (remoteRes.statusCode !== 200) {
              if (!res.headersSent) {
                res.status(remoteRes.statusCode || 502).json({
                  success: false,
                  error: `Storage returned status ${remoteRes.statusCode}. The file may have been deleted.`,
                });
              }
              return;
            }
            res.setHeader('Content-Disposition', `attachment; filename="${dlName}"`);
            res.setHeader('Content-Type', remoteRes.headers['content-type'] || 'application/octet-stream');
            if (remoteRes.headers['content-length']) {
              res.setHeader('Content-Length', remoteRes.headers['content-length']);
            }
            remoteRes.pipe(res);
          }).on('error', (err) => {
            console.error('❌ Stream error:', err.message);
            if (!res.headersSent) res.status(502).json({ success: false, error: 'Failed to download file from storage.' });
          });
        };
        streamFrom(targetUrl, 5);
      };

      // If it is a Cloudinary raw file URL (authenticated or upload)
      if (fileUrl.includes('cloudinary.com') && (fileUrl.includes('/raw/authenticated/') || fileUrl.includes('/raw/upload/'))) {
        try {
          const urlObj = new URL(fileUrl);
          const pathParts = urlObj.pathname.split('/');
          
          // Find the upload or authenticated index
          let typeIdx = pathParts.indexOf('authenticated');
          const uploadType = typeIdx !== -1 ? 'authenticated' : 'upload';
          if (typeIdx === -1) typeIdx = pathParts.indexOf('upload');
          
          let publicIdParts = pathParts.slice(typeIdx + 1);
          
          // Strip signature segment (s--xxxxx--)
          publicIdParts = publicIdParts.filter(p => !p.startsWith('s--'));
          
          // Strip version segment (v12345...)
          if (/^v\d+$/.test(publicIdParts[0])) {
            publicIdParts = publicIdParts.slice(1);
          }
          const publicId = publicIdParts.join('/');

          console.log(`📥 Cloudinary download: publicId="${publicId}", type="${uploadType}"`);

          // Use private_download_url to generate a proper API download URL
          const signedUrl = cloudinary.utils.private_download_url(publicId, '', {
            resource_type: 'raw',
            type: uploadType,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            attachment: true,
          });

          console.log(`📥 Cloudinary signed URL: "${signedUrl}"`);

          streamDirectUrl(signedUrl, downloadFilename);
          return;
        } catch (err) {
          console.warn('⚠️ Cloudinary signed URL error, falling back to direct stream:', err.message);
        }
      }

      // Fallback stream for any standard HTTP/HTTPS file URL
      streamDirectUrl(fileUrl, downloadFilename);
      return;
    }

    return res.status(404).json({ success: false, error: 'No valid design file is available for download.' });
  } catch (error) {
    next(error);
  }
};
