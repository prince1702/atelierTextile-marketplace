const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sellerName: {
    type: String,
    required: true,
  },
  sellerEmail: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  period: {
    type: String, // e.g. "August 2026" or "Monthly Settlement"
    required: true,
    default: function () {
      const date = new Date();
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    },
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'gpay', 'bank_transfer', 'other'],
    default: 'upi',
  },
  paymentId: {
    type: String,
    required: true, // UPI ID or GPay phone number
  },
  transactionRef: {
    type: String,
    trim: true,
    default: '', // Bank/UPI UTR or Txn ID entered by Admin
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  paidByName: {
    type: String,
    default: 'Admin',
  },
  paidAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payout', payoutSchema);
