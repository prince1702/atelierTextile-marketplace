const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  design: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design',
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  sellerName: {
    type: String,
    required: true,
  },
  designTitle: {
    type: String,
    required: true,
  },
  designImage: {
    type: String,
    default: '',
  },
  rating: {
    type: String,
    enum: ['Good', 'Very Good', 'Not Good', 'Duplicate', 'Refund'],
    required: true,
  },
  comment: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

feedbackSchema.index({ seller: 1 });
feedbackSchema.index({ customer: 1 });
feedbackSchema.index({ order: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
