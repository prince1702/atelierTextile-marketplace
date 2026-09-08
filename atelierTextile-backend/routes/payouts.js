const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const {
  updatePayoutDetails,
  getMyPayouts,
  getAdminPendingPayouts,
  processSellerPayout,
  getAdminPayoutHistory,
} = require('../controllers/payoutController');

// Seller routes
router.put('/details', auth, updatePayoutDetails);
router.get('/my-history', auth, authorize('seller'), getMyPayouts);

// Admin routes
router.get('/admin/pending', auth, authorize('admin'), getAdminPendingPayouts);
router.post('/admin/pay/:sellerId', auth, authorize('admin'), processSellerPayout);
router.get('/admin/history', auth, authorize('admin'), getAdminPayoutHistory);

module.exports = router;
