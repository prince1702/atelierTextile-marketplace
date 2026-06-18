const Cart = require('../models/Cart');
const Design = require('../models/Design');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Customer
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      'items.design',
      'title price image designerName licenseType category'
    );

    if (!cart) {
      cart = { user: req.user.id, items: [] };
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Customer
exports.addToCart = async (req, res, next) => {
  try {
    const { designId, licenseType } = req.body;

    if (!designId) {
      return res.status(400).json({
        success: false,
        error: 'designId is required',
      });
    }

    // Verify design exists and is active
    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({ success: false, error: 'Design not found' });
    }

    if (design.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'This design is not available',
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{ design: designId, licenseType: licenseType || design.licenseType }],
      });
    } else {
      // Check if design already in cart — do not add duplicate
      const alreadyInCart = cart.items.some(
        (item) => item.design.toString() === designId
      );

      if (!alreadyInCart) {
        cart.items.push({
          design: designId,
          licenseType: licenseType || design.licenseType,
        });
        await cart.save();
      }
    }

    // Populate for response
    cart = await Cart.findOne({ user: req.user.id }).populate(
      'items.design',
      'title price image designerName licenseType category'
    );

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:designId
// @access  Customer
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.design.toString() !== req.params.designId
    );

    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user.id }).populate(
      'items.design',
      'title price image designerName licenseType category'
    );

    res.status(200).json({
      success: true,
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Customer
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { user: req.user.id, items: [] },
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};
