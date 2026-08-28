const Offer = require('../models/Offer');
const { syncOfferStatuses, getActiveOffer } = require('../utils/offerHelper');

// @desc    Create a new offer
// @route   POST /api/offers
// @access  Private (Admin)
exports.createOffer = async (req, res, next) => {
  try {
    const { offerName, offerType, discountPercentage, startDateTime, endDateTime, priority, status } = req.body;

    if (!offerName || !discountPercentage || !startDateTime || !endDateTime) {
      return res.status(400).json({
        success: false,
        error: 'Offer name, discount percentage, start date, and end date are required',
      });
    }

    const discountNum = Number(discountPercentage);
    if (isNaN(discountNum) || discountNum < 1 || discountNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Discount percentage must be a number between 1% and 100%',
      });
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid start or end date format',
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        error: 'Start date/time must be strictly before end date/time',
      });
    }

    // Determine initial status
    const now = new Date();
    let initialStatus = status || 'scheduled';
    if (initialStatus !== 'disabled') {
      if (now < start) initialStatus = 'scheduled';
      else if (now >= start && now <= end) initialStatus = 'active';
      else if (now > end) initialStatus = 'expired';
    }

    const offer = await Offer.create({
      offerName,
      offerType: offerType || 'Festival Offer',
      discountPercentage: discountNum,
      startDateTime: start,
      endDateTime: end,
      priority: priority !== undefined ? Number(priority) : 1,
      status: initialStatus,
    });

    res.status(201).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all offers with search and filter
// @route   GET /api/offers
// @access  Private (Admin)
exports.getOffers = async (req, res, next) => {
  try {
    await syncOfferStatuses();

    const { search, status, offerType, sort } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (offerType && offerType !== 'all') {
      filter.offerType = offerType;
    }

    if (search && search.trim()) {
      filter.offerName = { $regex: search.trim(), $options: 'i' };
    }

    let sortOption = { startDateTime: -1 };
    if (sort === 'date_asc') sortOption = { startDateTime: 1 };
    else if (sort === 'discount_desc') sortOption = { discountPercentage: -1 };
    else if (sort === 'priority') sortOption = { priority: -1 };

    const offers = await Offer.find(filter).sort(sortOption);

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single offer
// @route   GET /api/offers/:id
// @access  Private (Admin)
exports.getOffer = async (req, res, next) => {
  try {
    await syncOfferStatuses();

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, error: 'Offer not found' });
    }

    res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update offer
// @route   PUT /api/offers/:id
// @access  Private (Admin)
exports.updateOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, error: 'Offer not found' });
    }

    const { offerName, offerType, discountPercentage, startDateTime, endDateTime, priority, status } = req.body;

    if (discountPercentage !== undefined) {
      const discountNum = Number(discountPercentage);
      if (isNaN(discountNum) || discountNum < 1 || discountNum > 100) {
        return res.status(400).json({
          success: false,
          error: 'Discount percentage must be a number between 1% and 100%',
        });
      }
      offer.discountPercentage = discountNum;
    }

    const start = startDateTime ? new Date(startDateTime) : offer.startDateTime;
    const end = endDateTime ? new Date(endDateTime) : offer.endDateTime;

    if (start >= end) {
      return res.status(400).json({
        success: false,
        error: 'Start date/time must be strictly before end date/time',
      });
    }

    if (offerName) offer.offerName = offerName;
    if (offerType) offer.offerType = offerType;
    if (priority !== undefined) offer.priority = Number(priority);
    offer.startDateTime = start;
    offer.endDateTime = end;

    if (status !== undefined) {
      offer.status = status;
    } else if (offer.status !== 'disabled') {
      const now = new Date();
      if (now < start) offer.status = 'scheduled';
      else if (now >= start && now <= end) offer.status = 'active';
      else if (now > end) offer.status = 'expired';
    }

    await offer.save();

    res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enable/Disable offer
// @route   PATCH /api/offers/:id/toggle
// @access  Private (Admin)
exports.toggleOfferStatus = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, error: 'Offer not found' });
    }

    if (offer.status === 'disabled') {
      const now = new Date();
      const start = new Date(offer.startDateTime);
      const end = new Date(offer.endDateTime);
      if (now < start) offer.status = 'scheduled';
      else if (now >= start && now <= end) offer.status = 'active';
      else offer.status = 'expired';
    } else {
      offer.status = 'disabled';
    }

    await offer.save();

    res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Private (Admin)
exports.deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, error: 'Offer not found' });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary stats for offers
// @route   GET /api/offers/stats
// @access  Private (Admin)
exports.getOffersStats = async (req, res, next) => {
  try {
    await syncOfferStatuses();

    const [totalOffers, activeCount, scheduledCount, expiredCount, disabledCount] = await Promise.all([
      Offer.countDocuments(),
      Offer.countDocuments({ status: 'active' }),
      Offer.countDocuments({ status: 'scheduled' }),
      Offer.countDocuments({ status: 'expired' }),
      Offer.countDocuments({ status: 'disabled' }),
    ]);

    const activeOffer = await getActiveOffer();

    let remainingSeconds = 0;
    if (activeOffer && activeOffer.endDateTime) {
      remainingSeconds = Math.max(0, Math.floor((new Date(activeOffer.endDateTime).getTime() - Date.now()) / 1000));
    }

    res.status(200).json({
      success: true,
      data: {
        totalOffers,
        activeOffersCount: activeCount,
        scheduledOffersCount: scheduledCount,
        expiredOffersCount: expiredCount,
        disabledOffersCount: disabledCount,
        currentActiveOffer: activeOffer ? {
          ...activeOffer.toObject(),
          remainingSeconds,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active offer for customer frontend (public)
// @route   GET /api/offers/active
// @access  Public
exports.getActiveOfferPublic = async (req, res, next) => {
  try {
    const activeOffer = await getActiveOffer();

    let remainingSeconds = 0;
    if (activeOffer && activeOffer.endDateTime) {
      remainingSeconds = Math.max(0, Math.floor((new Date(activeOffer.endDateTime).getTime() - Date.now()) / 1000));
    }

    res.status(200).json({
      success: true,
      data: activeOffer ? {
        id: activeOffer._id,
        offerName: activeOffer.offerName,
        offerType: activeOffer.offerType,
        discountPercentage: activeOffer.discountPercentage,
        endDateTime: activeOffer.endDateTime,
        remainingSeconds,
      } : null,
    });
  } catch (error) {
    next(error);
  }
};
