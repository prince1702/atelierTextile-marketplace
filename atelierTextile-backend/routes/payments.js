const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
} = require('../controllers/paymentController');

// Customer payment endpoints
router.post('/create-razorpay-order', auth, authorize('customer'), createRazorpayOrder);
router.post('/verify-razorpay-payment', auth, authorize('customer'), verifyRazorpayPayment);

// Webhook endpoint (public)
router.post('/webhook', handleRazorpayWebhook);

module.exports = router;
