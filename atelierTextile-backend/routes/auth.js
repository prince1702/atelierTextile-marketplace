const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  register,
  sendSignupOtp,
  verifySignupOtp,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  logout,
  registerValidation,
  loginValidation,
} = require('../controllers/authController');

// Simple in-memory rate limiter for forgot-password (no external package needed)
const forgotPasswordAttempts = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 3;

// Clean up expired entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of forgotPasswordAttempts) {
    if (now - data.startTime > RATE_LIMIT_WINDOW_MS) {
      forgotPasswordAttempts.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

const forgotPasswordLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const record = forgotPasswordAttempts.get(ip);

  if (!record || now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    // First request or window expired — start a new window
    forgotPasswordAttempts.set(ip, { count: 1, startTime: now });
    return next();
  }

  if (record.count < RATE_LIMIT_MAX) {
    record.count++;
    return next();
  }

  // Rate limit exceeded
  return res.status(429).json({
    success: false,
    error: 'Too many password reset attempts. Please try again after 15 minutes.',
  });
};

router.post('/register', registerValidation, register);
router.post('/send-otp', sendSignupOtp);
router.post('/verify-otp', verifySignupOtp);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/change-password', auth, changePassword);
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);

module.exports = router;

