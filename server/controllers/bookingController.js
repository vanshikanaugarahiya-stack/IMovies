const Booking = require('../models/Booking');
const Movie = require('../models/Movie');

// Helper to determine tier and price based on cinema row
// Row A, B: VIP Recliner (Base Price * 1.6)
// Row C, D, E: Gold (Base Price * 1.2)
// Row F, G: Silver (Base Price)
const getSeatTierAndPrice = (seatNumber, basePrice) => {
  const row = seatNumber.charAt(0).toUpperCase();
  if (row === 'A' || row === 'B') {
    return {
      tier: 'VIP Recliner',
      price: Math.round(basePrice * 1.6),
    };
  } else if (row === 'C' || row === 'D' || row === 'E') {
    return {
      tier: 'Gold',
      price: Math.round(basePrice * 1.2),
    };
  } else {
    return {
      tier: 'Silver',
      price: Math.round(basePrice),
    };
  }
};

// Helper to generate unique Cinema Booking ID (e.g. IMV-629401)
const generateBookingId = () => {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `IMV-${randomDigits}`;
};

// @desc    Create a new movie ticket booking with server-side price validation
// @route   POST /api/bookings
// @access  Private (Authenticated users)
const createBooking = async (req, res) => {
  try {
    const { movieId, showDate, showtime, seats } = req.body;

    // 1. Basic field presence validation
    if (!movieId || !showDate || !showtime || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movieId, showDate, showtime, and at least one seat',
      });
    }

    // 2. Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(showDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid showDate format. Expected YYYY-MM-DD.',
      });
    }

    // 3. Validate seat naming conventions (Rows A-G, 1-8)
    const validSeatRegex = /^[A-Ga-g][1-8]$/;
    const normalizedSeats = seats.map((s) => s.trim().toUpperCase());
    const invalidSeats = normalizedSeats.filter((s) => !validSeatRegex.test(s));

    if (invalidSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid seat identifier(s): ${invalidSeats.join(', ')}. Valid seats range from A1 to G8.`,
      });
    }

    // Check for duplicates in the request itself
    const uniqueRequestedSeats = [...new Set(normalizedSeats)];
    if (uniqueRequestedSeats.length !== normalizedSeats.length) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate seats selected in request',
      });
    }

    // 4. Verify movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // 5. Verify showtime is valid for this movie
    if (movie.showtimes && movie.showtimes.length > 0) {
      if (!movie.showtimes.includes(showtime)) {
        return res.status(400).json({
          success: false,
          message: `Showtime "${showtime}" is not available for ${movie.title}`,
        });
      }
    }

    // 6. Double-booking check: Ensure none of the requested seats are already booked
    const existingConflict = await Booking.findOne({
      movie: movieId,
      showDate,
      showtime,
      paymentStatus: { $ne: 'Cancelled' },
      seats: { $in: uniqueRequestedSeats },
    });

    if (existingConflict) {
      const taken = uniqueRequestedSeats.filter((s) => existingConflict.seats.includes(s));
      return res.status(409).json({
        success: false,
        message: `Seats already booked by another customer: ${taken.join(', ')}`,
        conflictingSeats: taken,
      });
    }

    // 7. Authoritative Server-Side Price Calculation (NEVER trust frontend price)
    const basePrice = movie.ticketPrice || 250;
    const CONVENIENCE_FEE = 30; // ₹30 flat demo fee
    let subtotal = 0;

    const seatDetails = uniqueRequestedSeats.map((seatNum) => {
      const { tier, price } = getSeatTierAndPrice(seatNum, basePrice);
      subtotal += price;
      return {
        seatNumber: seatNum,
        tier,
        price,
      };
    });

    const totalAmount = subtotal + CONVENIENCE_FEE;

    // 8. Generate unique Booking ID
    let uniqueId = generateBookingId();
    let isUnique = false;
    while (!isUnique) {
      const existing = await Booking.findOne({ bookingId: uniqueId });
      if (!existing) isUnique = true;
      else uniqueId = generateBookingId();
    }

    // 9. Save booking
    const booking = await Booking.create({
      bookingId: uniqueId,
      user: req.user._id,
      movie: movieId,
      showDate,
      showtime,
      seats: uniqueRequestedSeats,
      seatDetails,
      subtotal,
      convenienceFee: CONVENIENCE_FEE,
      totalAmount,
      paymentStatus: 'Completed',
      paymentMethod: 'Demo Checkout (Instant)',
    });

    const populatedBooking = await Booking.findById(booking._id).populate(
      'movie',
      'title poster banner duration genre ticketPrice rating'
    );

    res.status(201).json({
      success: true,
      message: 'Cinema ticket booked successfully!',
      booking: populatedBooking,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process booking',
      error: error.message,
    });
  }
};

// @desc    Get all occupied/reserved seats for a specific movie show
// @route   GET /api/bookings/occupied-seats
// @access  Public
const getOccupiedSeats = async (req, res) => {
  try {
    const { movieId, showDate, showtime } = req.query;

    if (!movieId || !showDate || !showtime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movieId, showDate, and showtime query parameters',
      });
    }

    const bookings = await Booking.find({
      movie: movieId,
      showDate,
      showtime,
      paymentStatus: { $ne: 'Cancelled' },
    });

    const occupiedSeats = [];
    bookings.forEach((b) => {
      occupiedSeats.push(...b.seats);
    });

    res.status(200).json({
      success: true,
      occupiedSeats: [...new Set(occupiedSeats)],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch occupied seats',
      error: error.message,
    });
  }
};

// @desc    Get currently logged-in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title poster banner duration genre rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your bookings',
      error: error.message,
    });
  }
};

// @desc    Get all bookings (Admin Dashboard Analytics)
// @route   GET /api/bookings/all
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('movie', 'title ticketPrice poster')
      .sort({ createdAt: -1 });

    const activeBookings = bookings.filter((b) => b.paymentStatus === 'Completed');
    const cancelledBookings = bookings.filter((b) => b.paymentStatus === 'Cancelled');

    const totalRevenue = activeBookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );

    res.status(200).json({
      success: true,
      count: bookings.length,
      activeCount: activeBookings.length,
      cancelledCount: cancelledBookings.length,
      totalRevenue,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all bookings',
      error: error.message,
    });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user is the booking owner or an admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    booking.paymentStatus = 'Cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been released.',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getOccupiedSeats,
  getMyBookings,
  getAllBookings,
  cancelBooking,
};
