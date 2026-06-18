const Ticket = require('../models/Ticket');

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Admin only
exports.getTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find()
      .populate('user', 'name email initials role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's tickets
// @route   GET /api/tickets/my
// @access  Any authenticated user
exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Admin or ticket owner
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      'user',
      'name email initials role'
    );

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // Only admin or the ticket creator
    if (
      req.user.role !== 'admin' &&
      ticket.user._id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this ticket',
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create support ticket
// @route   POST /api/tickets
// @access  Any authenticated user
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, description, priority, category } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        error: 'Subject and description are required',
      });
    }

    const ticket = await Ticket.create({
      subject,
      description,
      priority: priority || 'medium',
      category: category || 'Other',
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status
// @route   PATCH /api/tickets/:id/status
// @access  Admin only
exports.updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be open, in-progress, resolved, or closed',
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};
