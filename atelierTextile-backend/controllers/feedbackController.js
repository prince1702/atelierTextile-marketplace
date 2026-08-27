const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Submit feedback for an order
// @route   POST /api/feedback
// @access  Private (Customer)
exports.createFeedback = async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Order ID and rating are required',
      });
    }

    const validRatings = ['Good', 'Very Good', 'Not Good', 'Duplicate', 'Refund'];
    if (!validRatings.includes(rating)) {
      return res.status(400).json({
        success: false,
        error: `Rating must be one of: ${validRatings.join(', ')}`,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // Verify order belongs to customer
    if (order.buyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You can only give feedback on your own orders',
      });
    }

    const customerUser = await User.findById(req.user.id);
    const customerName = customerUser ? customerUser.name : order.buyerName;

    // Check if feedback already exists for this order
    let feedback = await Feedback.findOne({ order: orderId, customer: req.user.id });

    if (feedback) {
      feedback.rating = rating;
      feedback.comment = comment || '';
      await feedback.save();
    } else {
      feedback = await Feedback.create({
        order: order._id,
        design: order.design,
        seller: order.seller,
        customer: req.user.id,
        customerName: customerName,
        sellerName: order.sellerName,
        designTitle: order.designTitle,
        designImage: order.designImage || '',
        rating,
        comment: comment || '',
      });
    }

    res.status(201).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback submitted by current logged in customer
// @route   GET /api/feedback/my
// @access  Private (Customer)
exports.getCustomerFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ customer: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback for particular seller (customer identity hidden)
// @route   GET /api/feedback/seller
// @access  Private (Seller)
exports.getSellerFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ seller: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Hide customer identity for seller
    const sanitizedFeedbacks = feedbacks.map((item) => ({
      _id: item._id,
      order: item.order,
      design: item.design,
      designTitle: item.designTitle,
      designImage: item.designImage,
      seller: item.seller,
      sellerName: item.sellerName,
      customerName: 'Anonymous Customer', // HIDDEN for seller
      rating: item.rating,
      comment: item.comment,
      createdAt: item.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: sanitizedFeedbacks.length,
      data: sanitizedFeedbacks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedback for Admin (with full customer identity)
// @route   GET /api/feedback/admin
// @access  Private (Admin)
exports.getAdminFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }
};
