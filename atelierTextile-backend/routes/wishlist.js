const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController');

router.get('/', auth, authorize('customer'), getWishlist);
router.post('/:designId', auth, authorize('customer'), toggleWishlist);

module.exports = router;
