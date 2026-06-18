const Wishlist = require('../models/Wishlist');
const Design = require('../models/Design');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Customer
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
      'designs',
      'title price image designerName rating category badge badgeColor fabric'
    );

    if (!wishlist) {
      wishlist = { user: req.user.id, designs: [] };
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle design in wishlist (add if not present, remove if present)
// @route   POST /api/wishlist/:designId
// @access  Customer
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { designId } = req.params;

    // Verify design exists
    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({ success: false, error: 'Design not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    let action;

    if (!wishlist) {
      // Create wishlist and add design
      wishlist = await Wishlist.create({
        user: req.user.id,
        designs: [designId],
      });
      action = 'added';
    } else {
      const index = wishlist.designs.findIndex(
        (id) => id.toString() === designId
      );

      if (index > -1) {
        // Remove from wishlist
        wishlist.designs.splice(index, 1);
        action = 'removed';
      } else {
        // Add to wishlist
        wishlist.designs.push(designId);
        action = 'added';
      }

      await wishlist.save();
    }

    // Populate for response
    wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
      'designs',
      'title price image designerName rating category badge badgeColor fabric'
    );

    res.status(200).json({
      success: true,
      action,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};
