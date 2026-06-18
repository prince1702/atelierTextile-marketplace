const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin only
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin or self
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Only admin or the user themselves
    if (req.user.role !== 'admin' && req.user.id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your own profile',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Admin or self
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Only admin or the user themselves
    if (req.user.role !== 'admin' && req.user.id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own profile',
      });
    }

    // Prevent non-admins from changing their own role or status
    if (req.user.role !== 'admin') {
      delete req.body.role;
      delete req.body.status;
      delete req.body.totalRevenue;
      delete req.body.totalOrders;
    }

    // Don't allow password updates through this route
    delete req.body.password;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (activate/suspend/approve)
// @route   PATCH /api/users/:id/status
// @access  Admin only
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be active, pending, or suspended',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Admin only
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active sellers (public)
// @route   GET /api/users/sellers
// @access  Public
exports.getSellers = async (req, res, next) => {
  try {
    const sellers = await User.find({ role: 'seller', status: 'active' })
      .select('name initials avatar country totalRevenue totalOrders createdAt')
      .sort({ totalRevenue: -1 });

    res.status(200).json({
      success: true,
      count: sellers.length,
      data: sellers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform stats (admin dashboard)
// @route   GET /api/users/stats
// @access  Admin only
exports.getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalSellers, totalCustomers, allOrders] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'customer' }),
      Order.find(),
    ]);

    const totalRevenue = allOrders.reduce((sum, order) => {
      if (order.status === 'completed') return sum + order.amount;
      return sum;
    }, 0);

    const totalOrders = allOrders.length;

    // Generate monthly data from orders (last 12 months)
    const now = new Date();
    const monthlyRevenue = [];
    const monthlyOrders = [];
    const monthlyUsers = [];

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const monthOrders = allOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= monthStart && d <= monthEnd;
      });

      monthlyRevenue.push(
        monthOrders
          .filter((o) => o.status === 'completed')
          .reduce((sum, o) => sum + o.amount, 0)
      );
      monthlyOrders.push(monthOrders.length);

      const usersInMonth = await User.countDocuments({
        createdAt: { $lte: monthEnd },
      });
      monthlyUsers.push(usersInMonth);
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalSellers,
        totalCustomers,
        totalRevenue,
        totalOrders,
        monthlyRevenue,
        monthlyUsers,
        monthlyOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};
