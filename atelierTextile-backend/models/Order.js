const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  design: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design',
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
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sellerName: {
    type: String,
    required: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  buyerName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'processing', 'refunded'],
    default: 'pending',
  },
  licenseType: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.index({ buyer: 1 });
orderSchema.index({ seller: 1 });

module.exports = mongoose.model('Order', orderSchema);
