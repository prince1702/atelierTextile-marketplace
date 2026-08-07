const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'seller', 'customer'],
    default: 'customer',
  },
  avatar: {
    type: String,
    default: '',
  },
  initials: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'suspended'],
    default: 'active',
  },
  country: {
    type: String,
    default: '',
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate initials from name before saving
userSchema.pre('save', async function (next) {
  // Generate initials
  if (this.isModified('name')) {
    const parts = this.name.trim().split(/\s+/);
    this.initials = parts.map((p) => p[0].toUpperCase()).join('').slice(0, 2);
  }

  // Hash password
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate a random 32-byte token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash it and store in the DB (we never store the raw token)
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiry to 1 hour from now
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  // Return the unhashed token (this is what goes in the email link)
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
