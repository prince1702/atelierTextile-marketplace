const Order = require('../models/Order');
const Design = require('../models/Design');
const User = require('../models/User');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Admin only
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current customer's orders
// @route   GET /api/orders/my
// @access  Customer
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders for seller's designs
// @route   GET /api/orders/seller
// @access  Seller
exports.getSellerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ seller: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Admin or involved user (buyer/seller)
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Check access: admin, buyer, or seller
    const isAdmin = req.user.role === 'admin';
    const isBuyer = order.buyer.toString() === req.user.id.toString();
    const isSeller = order.seller.toString() === req.user.id.toString();

    if (!isAdmin && !isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Place a new order
// @route   POST /api/orders
// @access  Customer
exports.createOrder = async (req, res, next) => {
  try {
    const { designId, licenseType } = req.body;

    if (!designId) {
      return res.status(400).json({
        success: false,
        error: 'designId is required',
      });
    }

    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({ success: false, error: 'Design not found' });
    }

    if (design.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'This design is not available for purchase',
      });
    }

    const buyer = await User.findById(req.user.id);
    if (!buyer) {
      return res.status(404).json({ success: false, error: 'Buyer not found' });
    }

    const seller = await User.findById(design.designer);
    if (!seller) {
      return res.status(404).json({ success: false, error: 'Seller not found' });
    }

    const order = await Order.create({
      design: design._id,
      designTitle: design.title,
      designImage: design.image,
      seller: seller._id,
      sellerName: seller.name,
      buyer: buyer._id,
      buyerName: buyer.name,
      amount: design.price,
      licenseType: licenseType || design.licenseType,
      status: 'pending',
    });

    // Update design stats
    design.sales += 1;
    design.revenue += design.price;
    await design.save();

    // Update buyer stats
    buyer.totalOrders += 1;
    await buyer.save();

    // Update seller stats
    seller.totalOrders += 1;
    seller.totalRevenue += design.price;
    await seller.save();

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Admin only
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['completed', 'pending', 'processing', 'refunded'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be completed, pending, processing, or refunded',
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
