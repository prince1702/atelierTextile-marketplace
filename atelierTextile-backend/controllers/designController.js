const Design = require('../models/Design');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'atelierTextile/designs', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// @desc    Get all active designs (public, with filters & pagination)
// @route   GET /api/designs
// @access  Public
exports.getDesigns = async (req, res, next) => {
  try {
    const {
      category,
      fabric,
      minPrice,
      maxPrice,
      search,
      badge,
      sort,
      page = 1,
      limit = 12,
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
    if (fabric) filter.fabric = fabric;
    if (badge) filter.badge = badge;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
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

    let imageUrl = '';

    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        imageUrl = result.secure_url;
      } catch (cloudinaryError) {
        console.warn('⚠️ Cloudinary upload failed, using local fallback:', cloudinaryError.message);
        imageUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500';
      }
    } else {
      imageUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500';
    }

    const design = await Design.create({
      ...req.body,
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

    // Upload new image if provided
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        req.body.image = result.secure_url;
      } catch (cloudinaryError) {
        console.warn('⚠️ Cloudinary upload failed during edit, using fallback:', cloudinaryError.message);
        req.body.image = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500';
      }
    }

    // Parse array fields if sent as strings
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map((t) => t.trim());
    }
    if (req.body.colorways && typeof req.body.colorways === 'string') {
      req.body.colorways = req.body.colorways.split(',').map((c) => c.trim());
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
