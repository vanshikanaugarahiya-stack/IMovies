const express = require('express');
const router = express.Router();
const {
  createBooking,
  getOccupiedSeats,
  getMyBookings,
  getAllBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Public seat check
router.get('/occupied-seats', getOccupiedSeats);

// User protected routes
router.post('/', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getMyBookings);
router.put('/:id/cancel', verifyToken, cancelBooking);

// Admin-only route
router.get('/all', verifyToken, verifyAdmin, getAllBookings);

module.exports = router;
