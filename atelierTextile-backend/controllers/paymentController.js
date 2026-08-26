const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TUTUmknNdaqTYQ';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '5fmSTOiUfqpDW2rUYvFuZy2w';
  return new Razorpay({ key_id, key_secret });
};

// @desc    Create a Razorpay order for an existing order ID
// @route   POST /api/payments/create-razorpay-order
// @access  Customer
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Amount must be in smallest currency unit (paise for INR)
    const amountInPaise = Math.round(order.amount * 100);

    if (amountInPaise <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid order amount' });
    }

    const razorpay = getRazorpayInstance();
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${order._id.toString().slice(-10)}`,
      notes: {
        orderId: order._id.toString(),
        buyerId: req.user.id.toString(),
        buyerName: req.user.name || '',
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    order.razorpayOrderId = razorpayOrder.id;
    order.paymentMethod = 'razorpay';
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TUTUmknNdaqTYQ',
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: order._id,
        designTitle: order.designTitle,
      },
    });
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    next(error);
  }
};

// @desc    Verify Razorpay payment signature & mark order as completed
// @route   POST /api/payments/verify-razorpay-payment
// @access  Customer
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required Razorpay payment verification details',
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '5fmSTOiUfqpDW2rUYvFuZy2w';
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Razorpay payment signature verification failed',
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.status = 'completed';
    order.isPaid = true;
    order.paidAt = new Date();
    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentMethod = 'razorpay';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Razorpay payment verified and order completed successfully',
      data: order,
    });
  } catch (error) {
    console.error('Razorpay Payment Verification Error:', error);
    next(error);
  }
};

// @desc    Handle Razorpay Webhooks
// @route   POST /api/payments/webhook
// @access  Public (Webhook)
exports.handleRazorpayWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-razorpay-signature'];
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment ? payload.payment.entity : null;
      const razorpayOrderId = paymentEntity ? paymentEntity.order_id : null;

      if (razorpayOrderId) {
        const order = await Order.findOne({ razorpayOrderId });
        if (order && order.status !== 'completed') {
          order.status = 'completed';
          order.isPaid = true;
          order.paidAt = new Date();
          order.razorpayPaymentId = paymentEntity.id;
          await order.save();
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    res.status(500).json({ success: false, error: 'Webhook processing error' });
  }
};
