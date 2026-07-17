const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const {
  getOrders,
  getMyOrders,
  getSellerOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
} = require('../controllers/orderController');

// Customer
router.get('/my', auth, authorize('customer'), getMyOrders);
router.post('/', auth, authorize('customer'), createOrder);

// Seller
router.get('/seller', auth, authorize('seller'), getSellerOrders);

// Admin
router.get('/', auth, authorize('admin'), getOrders);
router.patch('/:id/status', auth, authorize('admin'), updateOrderStatus);

// Admin or involved user
router.get('/:id', auth, getOrder);

module.exports = router;
