const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const upload = require('../middleware/upload');
const {
  getOrders,
  getPaymentReviewOrders,
  getMyOrders,
  getSellerOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  uploadPaymentScreenshot,
  approveOrder,
  rejectOrder,
} = require('../controllers/orderController');

// Customer
router.get('/my', auth, authorize('customer'), getMyOrders);
router.post('/', auth, authorize('customer'), createOrder);
router.post('/:id/payment-screenshot', auth, authorize('customer'), upload.single('screenshot'), uploadPaymentScreenshot);

// Seller
router.get('/seller', auth, authorize('seller'), getSellerOrders);

// Admin
router.get('/', auth, authorize('admin'), getOrders);
router.get('/payment-review', auth, authorize('admin'), getPaymentReviewOrders);
router.post('/:id/approve', auth, authorize('admin'), approveOrder);
router.post('/:id/reject', auth, authorize('admin'), rejectOrder);
router.patch('/:id/status', auth, authorize('admin'), updateOrderStatus);

// Admin or involved user
router.get('/:id', auth, getOrder);

module.exports = router;
