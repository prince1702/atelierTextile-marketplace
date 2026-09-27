const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController');

router.get('/', auth, authorize('customer', 'seller', 'admin'), getWishlist);
router.post('/:designId', auth, authorize('customer', 'seller', 'admin'), toggleWishlist);

module.exports = router;
