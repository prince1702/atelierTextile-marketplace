const User = require('../models/User');
const Order = require('../models/Order');
const Payout = require('../models/Payout');
const sendEmail = require('../utils/sendEmail');

// @desc    Update seller payout details (UPI ID / Google Pay Number)
// @route   PUT /api/payouts/details
// @access  Seller / Self
exports.updatePayoutDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { upiId, gpayNumber, accountHolderName } = req.body;

    user.payoutDetails = {
      upiId: upiId !== undefined ? upiId.trim() : (user.payoutDetails?.upiId || ''),
      gpayNumber: gpayNumber !== undefined ? gpayNumber.trim() : (user.payoutDetails?.gpayNumber || ''),
      accountHolderName: accountHolderName !== undefined ? accountHolderName.trim() : (user.payoutDetails?.accountHolderName || ''),
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Payout details updated successfully',
      data: user.payoutDetails,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current seller's wallet balance, unpaid balance & payout history
// @route   GET /api/payouts/my-history
// @access  Seller
exports.getMyPayouts = async (req, res, next) => {
  try {
    const seller = await User.findById(req.user.id);
    if (!seller) {
      return res.status(404).json({ success: false, error: 'Seller not found' });
    }

    const [completedOrders, payouts] = await Promise.all([
      Order.find({ seller: req.user.id, status: 'completed' }),
      Payout.find({ seller: req.user.id }).sort({ paidAt: -1 }),
    ]);

    const grossSales = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const lifetimeEarnings = Math.round(grossSales * 0.60);
    const totalPaidOut = seller.totalPaidOut || 0;
    const unpaidBalance = Math.max(0, lifetimeEarnings - totalPaidOut);

    res.status(200).json({
      success: true,
      data: {
        grossSales,
        lifetimeEarnings,
        totalPaidOut,
        unpaidBalance,
        payoutDetails: seller.payoutDetails || { upiId: '', gpayNumber: '', accountHolderName: '' },
        payouts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sellers with pending (unpaid) wallet balances for Admin settlement
// @route   GET /api/payouts/admin/pending
// @access  Admin only
exports.getAdminPendingPayouts = async (req, res, next) => {
  try {
    const [sellers, completedOrders, recentPayouts] = await Promise.all([
      User.find({ role: 'seller' }).sort({ name: 1 }),
      Order.find({ status: 'completed' }),
      Payout.find().sort({ paidAt: -1 }),
    ]);

    const sellersWithPayoutData = sellers.map((seller) => {
      const sellerOrders = completedOrders.filter(
        (o) => o.seller && o.seller.toString() === seller._id.toString()
      );
      const grossSales = sellerOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      const lifetimeEarnings = Math.round(grossSales * 0.60);
      const totalPaidOut = seller.totalPaidOut || 0;
      const unpaidBalance = Math.max(0, lifetimeEarnings - totalPaidOut);

      const lastPayout = recentPayouts.find(
        (p) => p.seller && p.seller.toString() === seller._id.toString()
      );

      return {
        id: seller._id,
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        mobileNumber: seller.mobileNumber || '',
        initials: seller.initials,
        avatar: seller.avatar,
        grossSales,
        lifetimeEarnings,
        totalPaidOut,
        unpaidBalance,
        totalOrders: sellerOrders.length,
        payoutDetails: seller.payoutDetails || { upiId: '', gpayNumber: '', accountHolderName: '' },
        hasPaymentDetails: !!(seller.payoutDetails?.upiId || seller.payoutDetails?.gpayNumber),
        lastPayout: lastPayout
          ? {
              amount: lastPayout.amount,
              period: lastPayout.period,
              paidAt: lastPayout.paidAt,
              transactionRef: lastPayout.transactionRef,
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      count: sellersWithPayoutData.length,
      data: sellersWithPayoutData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process payout to a seller (Admin marks as Paid, resets unpaid balance)
// @route   POST /api/payouts/admin/pay/:sellerId
// @access  Admin only
exports.processSellerPayout = async (req, res, next) => {
  try {
    const seller = await User.findById(req.params.sellerId);
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ success: false, error: 'Seller not found' });
    }

    const completedOrders = await Order.find({ seller: seller._id, status: 'completed' });
    const grossSales = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const lifetimeEarnings = Math.round(grossSales * 0.60);
    const totalPaidOut = seller.totalPaidOut || 0;
    const unpaidBalance = Math.max(0, lifetimeEarnings - totalPaidOut);

    const { amount, period, paymentMethod, paymentId, transactionRef, notes } = req.body;

    const payoutAmount = amount !== undefined ? Number(amount) : unpaidBalance;

    if (payoutAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Payout amount must be greater than 0. Seller has no pending balance.',
      });
    }

    // Determine payment details
    const selectedMethod = paymentMethod || (seller.payoutDetails?.upiId ? 'upi' : 'gpay');
    const selectedPaymentId =
      paymentId ||
      seller.payoutDetails?.upiId ||
      seller.payoutDetails?.gpayNumber ||
      'Direct Settlement';

    const currentPeriod =
      period ||
      new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    // 1. Create Payout record
    const payout = await Payout.create({
      seller: seller._id,
      sellerName: seller.name,
      sellerEmail: seller.email,
      amount: payoutAmount,
      period: currentPeriod,
      paymentMethod: selectedMethod,
      paymentId: selectedPaymentId,
      transactionRef: transactionRef ? transactionRef.trim() : '',
      notes: notes ? notes.trim() : '',
      paidBy: req.user._id,
      paidByName: req.user.name || 'Admin',
      paidAt: new Date(),
      status: 'completed',
    });

    // 2. Update seller totalPaidOut (resets unpaid balance to 0)
    seller.totalPaidOut = (seller.totalPaidOut || 0) + payoutAmount;
    await seller.save();

    // 3. Send email confirmation to seller (non-blocking)
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 8px;">
          <h2 style="color: #105048; margin-top: 0;">Monthly Payout Processed 🎉</h2>
          <p>Dear <strong>${seller.name}</strong>,</p>
          <p>We are pleased to inform you that your seller wallet payout for <strong>${currentPeriod}</strong> has been successfully processed.</p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #15803d;">Amount Paid: ₹${payoutAmount.toLocaleString()}</p>
            <p style="margin: 5px 0 0; color: #374151;">Paid to: <strong>${selectedPaymentId}</strong> (${selectedMethod.toUpperCase()})</p>
            ${transactionRef ? `<p style="margin: 5px 0 0; color: #374151;">Transaction / UTR Ref: <strong>${transactionRef}</strong></p>` : ''}
          </div>
          <p>You can view your complete payout history and updated wallet in your seller portal.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af;">Thank you for partnering with TexDesigner Marketplace.</p>
        </div>
      `;
      sendEmail({
        to: seller.email,
        subject: `Monthly Payout Processed - ₹${payoutAmount.toLocaleString()} (${currentPeriod})`,
        html: emailHtml,
      }).catch((e) => console.log('Payout email notice failed:', e.message));
    } catch (e) {
      console.log('Error creating payout email:', e.message);
    }

    res.status(201).json({
      success: true,
      message: `Successfully processed payout of ₹${payoutAmount.toLocaleString()} for ${seller.name}`,
      data: payout,
      newUnpaidBalance: Math.max(0, lifetimeEarnings - seller.totalPaidOut),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all historical payouts with optional period or seller filter
// @route   GET /api/payouts/admin/history
// @access  Admin only
exports.getAdminPayoutHistory = async (req, res, next) => {
  try {
    const { period, sellerId, search } = req.query;
    const query = {};

    if (period) {
      query.period = period;
    }
    if (sellerId) {
      query.seller = sellerId;
    }

    let payouts = await Payout.find(query).sort({ paidAt: -1 });

    if (search && search.trim().length > 0) {
      const s = search.toLowerCase().trim();
      payouts = payouts.filter(
        (p) =>
          (p.sellerName && p.sellerName.toLowerCase().includes(s)) ||
          (p.sellerEmail && p.sellerEmail.toLowerCase().includes(s)) ||
          (p.paymentId && p.paymentId.toLowerCase().includes(s)) ||
          (p.transactionRef && p.transactionRef.toLowerCase().includes(s)) ||
          (p.period && p.period.toLowerCase().includes(s))
      );
    }

    res.status(200).json({
      success: true,
      count: payouts.length,
      data: payouts,
    });
  } catch (error) {
    next(error);
  }
};
