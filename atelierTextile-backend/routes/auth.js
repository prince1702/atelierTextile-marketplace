const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  register,
  login,
  forgotPassword,
  getMe,
  logout,
  registerValidation,
  loginValidation,
} = require('../controllers/authController');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPassword);
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);

module.exports = router;
