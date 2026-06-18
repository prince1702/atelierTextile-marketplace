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

router.get('/', auth, authorize('customer'), getCart);
router.post('/', auth, authorize('customer'), addToCart);
router.delete('/:designId', auth, authorize('customer'), removeFromCart);
router.delete('/', auth, authorize('customer'), clearCart);

module.exports = router;
