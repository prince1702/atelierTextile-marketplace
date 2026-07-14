const Order = require('../models/Order');
const Design = require('../models/Design');
const User = require('../models/User');
const Razorpay = require('razorpay');

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

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
const getPriceWithLicense = (price, licenseType) => {
  if (licenseType === 'Standard Regional') return price * 2.5;
  if (licenseType === 'Exclusive Global') return price * 8;
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
      return res.status(400).json({
        success: false,
        error: 'designId or items array is required',
      });
    }

    let totalAmount = 0;
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
      const itemPrice = getPriceWithLicense(design.price, license);
      totalAmount += itemPrice;
      
      processedItems.push({
        design,
        seller,
        licenseType: license,
        amount: itemPrice
      });
    }

    let razorpayOrder = null;
    if (razorpay) {
      try {
        const options = {
          amount: Math.round(totalAmount * 100), // amount in paise
          currency: 'INR',
          receipt: `receipt_order_${Date.now()}`,
        };
        razorpayOrder = await razorpay.orders.create(options);
      } catch (err) {
        console.error('Razorpay Order Creation Error:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to create payment gateway session',
        });
      }
    }

    const createdOrders = [];
    const buyer = await User.findById(req.user.id);
    if (!buyer) {
      return res.status(404).json({ success: false, error: 'Buyer not found' });
    }

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
        status: razorpayOrder ? 'pending' : 'completed',
        razorpayOrderId: razorpayOrder ? razorpayOrder.id : '',
      });

      createdOrders.push(order);

      // In Mock Mode, instantly update stats
      if (!razorpayOrder) {
        item.design.sales += 1;
        item.design.revenue += item.amount;
        await item.design.save();

        buyer.totalOrders += 1;

        item.seller.totalOrders += 1;
        item.seller.totalRevenue += item.amount;
        await item.seller.save();
      }
    }

    if (!razorpayOrder) {
      await buyer.save();
    }

    res.status(201).json({
      success: true,
      data: createdOrders.length === 1 && !items ? createdOrders[0] : createdOrders,
      razorpayOrder,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/orders/verify
// @access  Customer
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment details for verification',
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Payment gateway configuration is missing on the server',
      });
    }

    // Verify signature
    const crypto = require('crypto');
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed. Invalid signature.',
      });
    }

    // Update orders
    const orders = await Order.find({ razorpayOrderId: razorpay_order_id });
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No orders found matching this payment transaction',
      });
    }

    const buyer = await User.findById(req.user.id);
    if (!buyer) {
      return res.status(404).json({ success: false, error: 'Buyer not found' });
    }

    for (const order of orders) {
      if (order.status !== 'completed') {
        order.status = 'completed';
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        await order.save();

        const design = await Design.findById(order.design);
        if (design) {
          design.sales += 1;
          design.revenue += order.amount;
          await design.save();
        }

        buyer.totalOrders += 1;

        const seller = await User.findById(order.seller);
        if (seller) {
          seller.totalOrders += 1;
          seller.totalRevenue += order.amount;
          await seller.save();
        }
      }
    }

    await buyer.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified and orders completed successfully',
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
