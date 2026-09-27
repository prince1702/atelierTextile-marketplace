const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');

router.get('/', auth, authorize('customer', 'seller', 'admin'), getCart);
router.post('/', auth, authorize('customer', 'seller', 'admin'), addToCart);
router.delete('/:designId', auth, authorize('customer', 'seller', 'admin'), removeFromCart);
router.delete('/', auth, authorize('customer', 'seller', 'admin'), clearCart);

module.exports = router;
