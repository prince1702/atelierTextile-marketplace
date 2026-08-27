const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const {
  createFeedback,
  getCustomerFeedback,
  getSellerFeedback,
  getAdminFeedback,
} = require('../controllers/feedbackController');

router.post('/', auth, authorize('customer'), createFeedback);
router.get('/my', auth, authorize('customer'), getCustomerFeedback);
router.get('/seller', auth, authorize('seller'), getSellerFeedback);
router.get('/admin', auth, authorize('admin'), getAdminFeedback);

module.exports = router;
