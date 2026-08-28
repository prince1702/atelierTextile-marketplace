const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  offerName: {
    type: String,
    required: [true, 'Offer name is required'],
    trim: true,
  },
  offerType: {
    type: String,
    enum: ['Festival Offer', 'Seasonal Offer', 'Special Offer', 'Clearance Sale', 'Other'],
    default: 'Festival Offer',
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: [true, 'Discount percentage is required'],
    min: [1, 'Discount percentage must be at least 1%'],
    max: [100, 'Discount percentage cannot exceed 100%'],
  },
  startDateTime: {
    type: Date,
    required: [true, 'Start date and time is required'],
  },
  endDateTime: {
    type: Date,
    required: [true, 'End date and time is required'],
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'expired', 'disabled'],
    default: 'scheduled',
  },
  priority: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

offerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

offerSchema.index({ status: 1, priority: -1, startDateTime: 1, endDateTime: 1 });

module.exports = mongoose.model('Offer', offerSchema);
