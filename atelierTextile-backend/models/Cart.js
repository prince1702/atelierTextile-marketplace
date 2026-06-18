const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true,
  },
  items: [
    {
      design: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Design',
        required: true,
      },
      licenseType: {
        type: String,
        default: 'Standard Regional',
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model('Cart', cartSchema);
