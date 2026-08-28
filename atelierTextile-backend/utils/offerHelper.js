const Offer = require('../models/Offer');

/**
 * Evaluates offer date/times against server current date and updates database statuses.
 */
const syncOfferStatuses = async () => {
  try {
    const now = new Date();
    const offers = await Offer.find({ status: { $ne: 'disabled' } });

    for (const offer of offers) {
      const start = new Date(offer.startDateTime);
      const end = new Date(offer.endDateTime);

      let newStatus = offer.status;
      if (now < start) {
        newStatus = 'scheduled';
      } else if (now >= start && now <= end) {
        newStatus = 'active';
      } else if (now > end) {
        newStatus = 'expired';
      }

      if (offer.status !== newStatus) {
        offer.status = newStatus;
        await offer.save();
      }
    }
  } catch (error) {
    console.error('Error syncing offer statuses:', error);
  }
};

/**
 * Returns the single active offer with highest priority & discount.
 */
const getActiveOffer = async () => {
  try {
    await syncOfferStatuses();
    const activeOffers = await Offer.find({ status: 'active' })
      .sort({ priority: -1, discountPercentage: -1, updatedAt: -1 });

    return activeOffers.length > 0 ? activeOffers[0] : null;
  } catch (error) {
    console.error('Error getting active offer:', error);
    return null;
  }
};

/**
 * Applies active offer discount to a design object/document.
 */
const applyOfferToDesign = (designDoc, activeOffer) => {
  if (!designDoc) return designDoc;
  
  const obj = typeof designDoc.toObject === 'function' ? designDoc.toObject() : { ...designDoc };

  obj.originalPrice = obj.price;

  if (activeOffer && activeOffer.discountPercentage > 0) {
    const discount = activeOffer.discountPercentage;
    const discountedPrice = Math.max(1, Math.round(obj.originalPrice * (1 - discount / 100)));

    obj.discountPercentage = discount;
    obj.offerName = activeOffer.offerName;
    obj.offerType = activeOffer.offerType;
    obj.offerPrice = discountedPrice;
    obj.price = discountedPrice;

    if (obj.pdcPrice && obj.pdcPrice > 0) {
      obj.originalPdcPrice = obj.pdcPrice;
      obj.pdcPrice = Math.max(1, Math.round(obj.originalPdcPrice * (1 - discount / 100)));
    }
  } else {
    obj.discountPercentage = 0;
    obj.offerName = '';
    obj.offerType = '';
    obj.offerPrice = obj.originalPrice;
  }

  return obj;
};

module.exports = {
  syncOfferStatuses,
  getActiveOffer,
  applyOfferToDesign,
};
