const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const {
  getTickets,
  getMyTickets,
  getTicket,
  createTicket,
  updateTicketStatus,
} = require('../controllers/ticketController');

// Any authenticated user
router.get('/my', auth, getMyTickets);
router.post('/', auth, createTicket);

// Admin only
router.get('/', auth, authorize('admin'), getTickets);
router.patch('/:id/status', auth, authorize('admin'), updateTicketStatus);

// Admin or ticket owner
router.get('/:id', auth, getTicket);

module.exports = router;
