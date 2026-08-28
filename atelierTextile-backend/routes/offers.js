const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const {
  createOffer,
  getOffers,
  getOffer,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
  getOffersStats,
  getActiveOfferPublic,
} = require('../controllers/offerController');

// Public route for frontend active offer banner
router.get('/active', getActiveOfferPublic);

// Admin-protected routes
router.get('/stats', auth, authorize('admin'), getOffersStats);
router.get('/', auth, authorize('admin'), getOffers);
router.post('/', auth, authorize('admin'), createOffer);
router.get('/:id', auth, authorize('admin'), getOffer);
router.put('/:id', auth, authorize('admin'), updateOffer);
router.patch('/:id/toggle', auth, authorize('admin'), toggleOfferStatus);
router.delete('/:id', auth, authorize('admin'), deleteOffer);

module.exports = router;
