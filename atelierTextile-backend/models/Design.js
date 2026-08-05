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
    enum: ['Weaving Design', 'Embroidery Design', 'Digital Print Design', 'Position Print Design'],
    required: [true, 'Category is required'],
  },
  subcategory: {
    type: String,
    default: '',
  },
  fabric: {
    type: String,
    default: '', // optional - not required
  },

  designType: {
    type: String,
    default: '',
  },
  area: {
    type: String,
    default: '',
  },
  needle: {
    type: String,
    default: '',
  },
  height: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '',
  },
  designFormat: {
    type: String,
    default: '',
  },
  sareeConcept: {
    type: String,
    default: '',
  },
  pdcPrice: {
    type: Number,
    default: 0,
  },
  areaMin: {
    type: Number,
  },
  areaMax: {
    type: Number,
  },
  needleMin: {
    type: Number,
  },
  needleMax: {
    type: Number,
  },
  image: {
    type: String,
    default: '',
  },
  images: {
    type: [String],
    default: [],
  },
  additionalImages: {
    type: [String],
    default: [],
  },
  designFile: {
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
