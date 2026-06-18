const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true,
  },
  designs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design',
    },
  ],
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
