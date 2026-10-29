const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
    },
    poster: {
      type: String,
      required: [true, 'Poster image URL is required'],
    },
    banner: {
      type: String,
      default: '',
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
    },
    duration: {
      type: Number, // Duration in minutes
      required: [true, 'Duration in minutes is required'],
    },
    rating: {
      type: Number,
      default: 8.0,
      min: 0,
      max: 10,
    },
    language: {
      type: String,
      default: 'English',
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    ticketPrice: {
      type: Number,
      default: 250, // Base ticket price in INR / currency units
      required: true,
    },
    showtimes: {
      type: [String],
      default: ['10:00 AM', '01:30 PM', '05:00 PM', '08:30 PM', '11:00 PM'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    director: {
      type: String,
      default: '',
    },
    cast: {
      type: [String],
      default: [],
    },
    trailerUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Movie', movieSchema);
