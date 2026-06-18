const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Design title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  designer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  designerName: {
    type: String,
    required: true,
  },
  designerAvatar: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: String,
    enum: ['Geometric', 'Floral', 'Watercolor', 'Technical', 'Tapestry', 'Organic', 'Abstract'],
    required: [true, 'Category is required'],
  },
  fabric: {
    type: String,
    enum: ['Cotton Blend', 'Silk', 'Linen', 'Polyester Blend', 'Wool Blend', 'Cotton Sateen'],
    required: [true, 'Fabric type is required'],
  },
  image: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: {
    type: Number,
    default: 0,
  },
  tags: {
    type: [String],
    default: [],
  },
  badge: {
    type: String,
    enum: ['New Arrival', 'Limited Run', 'In Stock', 'Bestseller', ''],
    default: '',
  },
  badgeColor: {
    type: String,
    default: '',
  },
  dimensions: {
    type: String,
    default: '',
  },
  colorways: {
    type: [String],
    default: [],
  },
  licenseType: {
    type: String,
    enum: ['Exclusive Global', 'Standard Regional', 'Open Regional'],
    default: 'Standard Regional',
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'rejected'],
    default: 'pending',
  },
  sales: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for search and filtering
designSchema.index({ title: 'text', tags: 'text', designerName: 'text' });
designSchema.index({ category: 1, status: 1 });
designSchema.index({ designer: 1 });

module.exports = mongoose.model('Design', designSchema);
