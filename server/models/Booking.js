const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    showDate: {
      type: String,
      required: [true, 'Show date is required (YYYY-MM-DD)'],
    },
    showtime: {
      type: String,
      required: [true, 'Showtime is required (e.g. 08:30 PM)'],
    },
    seats: {
      type: [String],
      required: [true, 'At least one seat must be selected'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Must select at least one seat',
      },
    },
    seatDetails: [
      {
        seatNumber: String,
        tier: String,
        price: Number,
      },
    ],
    subtotal: {
      type: Number,
      default: 0,
    },
    convenienceFee: {
      type: Number,
      default: 30,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Completed', 'Pending', 'Cancelled'],
      default: 'Completed',
    },
    paymentMethod: {
      type: String,
      default: 'Demo Checkout (Instant)',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
