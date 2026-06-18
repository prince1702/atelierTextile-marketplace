const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const {
  getUsers,
  getUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getSellers,
  getPlatformStats,
} = require('../controllers/userController');

// Public
router.get('/sellers', getSellers);

// Admin only
router.get('/stats', auth, authorize('admin'), getPlatformStats);
router.get('/', auth, authorize('admin'), getUsers);
router.patch('/:id/status', auth, authorize('admin'), updateUserStatus);
router.delete('/:id', auth, authorize('admin'), deleteUser);

// Admin or self
router.get('/:id', auth, getUser);
router.put('/:id', auth, updateUser);

module.exports = router;
