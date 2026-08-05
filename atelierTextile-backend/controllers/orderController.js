const Order = require('../models/Order');
const Design = require('../models/Design');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Admin only
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders with payment screenshots pending admin review
// @route   GET /api/orders/payment-review
// @access  Admin only
exports.getPaymentReviewOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      paymentScreenshot: { $ne: '' },
      status: 'pending',
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current customer's orders
// @route   GET /api/orders/my
// @access  Customer
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).populate('design').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders for seller's designs
// @route   GET /api/orders/seller
// @access  Seller
exports.getSellerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ seller: req.user.id }).populate('design').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Admin or involved user (buyer/seller)
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('design');
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    const isAdmin = req.user.role === 'admin';
    const isBuyer = order.buyer.toString() === req.user.id.toString();
    const isSeller = order.seller.toString() === req.user.id.toString();
    if (!isAdmin && !isBuyer && !isSeller) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this order' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Place a new order — status starts as 'pending' (awaiting UPI payment + screenshot)
// @route   POST /api/orders
// @access  Customer
const getPriceWithLicense = (price, licenseType, design = null) => {
  if (licenseType === 'Standard Regional' || licenseType === 'Extended' || licenseType === 'Other' || licenseType === 'OTHER' || licenseType === 'TIF') return price * 2.5;
  if (licenseType === 'PDC') {
    return design && design.pdcPrice && design.pdcPrice > 0 ? design.pdcPrice : price * 2.5;
  }
  if (licenseType === 'Exclusive Global' || licenseType === 'Exclusive Buyout') return price * 8;
  return price;
};

exports.createOrder = async (req, res, next) => {
  try {
    const { designId, licenseType, items } = req.body;

    let purchaseItems = [];
    if (items && Array.isArray(items)) {
      purchaseItems = items;
    } else if (designId) {
      purchaseItems = [{ designId, licenseType }];
    } else {
      return res.status(400).json({ success: false, error: 'designId or items array is required' });
    }

    const processedItems = [];
    for (const item of purchaseItems) {
      const design = await Design.findById(item.designId);
      if (!design) {
        return res.status(404).json({ success: false, error: `Design ${item.designId} not found` });
      }
      if (design.status !== 'active') {
        return res.status(400).json({ success: false, error: `Design ${design.title} is not active` });
      }
      const seller = await User.findById(design.designer);
      if (!seller) {
        return res.status(404).json({ success: false, error: 'Seller not found' });
      }
      const license = item.licenseType || 'Open Regional';
      const itemPrice = getPriceWithLicense(design.price, license, design);
      processedItems.push({ design, seller, licenseType: license, amount: itemPrice });
    }

    const buyer = await User.findById(req.user.id);
    if (!buyer) {
      return res.status(404).json({ success: false, error: 'Buyer not found' });
    }

    const createdOrders = [];
    for (const item of processedItems) {
      const order = await Order.create({
        design: item.design._id,
        designTitle: item.design.title,
        designImage: item.design.image,
        seller: item.seller._id,
        sellerName: item.seller.name,
        buyer: buyer._id,
        buyerName: buyer.name,
        amount: item.amount,
        licenseType: item.licenseType,
        status: 'pending', // Awaiting UPI payment verification
      });
      createdOrders.push(order);
    }

    res.status(201).json({
      success: true,
      data: createdOrders.length === 1 && !items ? createdOrders[0] : createdOrders,
      totalAmount: processedItems.reduce((sum, i) => sum + i.amount, 0),
    });
  } catch (error) {
    next(error);
  }
};

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// @desc    Upload payment screenshot for an order
// @route   POST /api/orders/:id/payment-screenshot
// @access  Customer (buyer of that order)
exports.uploadPaymentScreenshot = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    if (order.buyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No screenshot file uploaded' });
    }

    // Delete old screenshot from Cloudinary if exists
    if (order.paymentScreenshotPublicId) {
      await cloudinary.uploader.destroy(order.paymentScreenshotPublicId);
    }

    const result = await uploadToCloudinary(req.file.buffer, 'payment_screenshots');
    order.paymentScreenshot = result.secure_url;
    order.paymentScreenshotPublicId = result.public_id;
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin approves a payment — marks order completed, updates stats
// @route   POST /api/orders/:id/approve
// @access  Admin only
exports.approveOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    if (order.status === 'completed') {
      return res.status(400).json({ success: false, error: 'Order is already approved' });
    }

    order.status = 'completed';
    order.paymentNote = '';
    await order.save();

    // Update design sales/revenue
    const design = await Design.findById(order.design);
    if (design) {
      design.sales += 1;
      design.revenue += order.amount;
      await design.save();
    }

    // Update buyer stats
    const buyer = await User.findById(order.buyer);
    if (buyer) {
      buyer.totalOrders += 1;
      await buyer.save();
    }

    // Update seller stats
    const seller = await User.findById(order.seller);
    if (seller) {
      seller.totalOrders += 1;
      seller.totalRevenue += order.amount;
      await seller.save();
    }

    res.status(200).json({ success: true, data: order, message: 'Order approved successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin rejects a payment
// @route   POST /api/orders/:id/reject
// @access  Admin only
exports.rejectOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.status = 'rejected';
    order.paymentNote = req.body.note || 'Payment rejected by admin.';
    await order.save();

    res.status(200).json({ success: true, data: order, message: 'Order rejected' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (generic, admin only)
// @route   PATCH /api/orders/:id/status
// @access  Admin only
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['completed', 'pending', 'processing', 'refunded', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
