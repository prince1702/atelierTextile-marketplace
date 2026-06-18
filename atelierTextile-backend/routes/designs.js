const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const upload = require('../middleware/upload');
const {
  getDesigns,
  getDesign,
  getDesignsByCategory,
  createDesign,
  updateDesign,
  deleteDesign,
  getMyListings,
  updateDesignStatus,
} = require('../controllers/designController');

// Public routes
router.get('/', getDesigns);
router.get('/category/:category', getDesignsByCategory);

// Seller routes (must come before /:id to avoid conflict)
router.get('/my/listings', auth, authorize('seller'), getMyListings);
router.post('/', auth, authorize('seller'), upload.single('image'), createDesign);

// Public single design
router.get('/:id', getDesign);

// Seller update/delete own design
router.put('/:id', auth, authorize('seller'), upload.single('image'), updateDesign);
router.delete('/:id', auth, authorize('seller', 'admin'), deleteDesign);

// Admin status update
router.patch('/:id/status', auth, authorize('admin'), updateDesignStatus);

module.exports = router;
