const Movie = require('../models/Movie');
const Booking = require('../models/Booking');

// @desc    Get all movies with optional genre & search filters
// @route   GET /api/movies
// @access  Public
const getAllMovies = async (req, res) => {
  try {
    const { genre, search } = req.query;
    let filter = {};

    if (genre && genre !== 'All') {
      filter.genre = { $in: [genre] };
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const movies = await Movie.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movies',
      error: error.message,
    });
  }
};

// @desc    Get featured movies for homepage hero carousel / banner
// @route   GET /api/movies/featured
// @access  Public
const getFeaturedMovies = async (req, res) => {
  try {
    const featured = await Movie.find({ featured: true }).limit(5);
    // If none marked featured, grab highest rated movies
    const movies = featured.length > 0 ? featured : await Movie.find().sort({ rating: -1 }).limit(5);

    res.status(200).json({
      success: true,
      movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured movies',
      error: error.message,
    });
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie details',
      error: error.message,
    });
  }
};

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res) => {
  try {
    const {
      title,
      description,
      poster,
      banner,
      genre,
      duration,
      rating,
      language,
      ticketPrice,
      showtimes,
      featured,
      director,
      cast,
      trailerUrl,
    } = req.body;

    if (!title || !description || !poster || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Title, Description, Poster URL, and Duration',
      });
    }

    // Format genres array
    let genreArray = ['Action'];
    if (Array.isArray(genre) && genre.length > 0) {
      genreArray = genre;
    } else if (typeof genre === 'string' && genre.trim()) {
      genreArray = genre.split(',').map((g) => g.trim()).filter(Boolean);
    }

    // Format showtimes array
    let showtimeArray = ['10:00 AM', '01:30 PM', '06:00 PM', '09:30 PM'];
    if (Array.isArray(showtimes) && showtimes.length > 0) {
      showtimeArray = showtimes;
    } else if (typeof showtimes === 'string' && showtimes.trim()) {
      showtimeArray = showtimes.split(',').map((s) => s.trim()).filter(Boolean);
    }

    // Format cast array
    let castArray = [];
    if (Array.isArray(cast)) {
      castArray = cast;
    } else if (typeof cast === 'string' && cast.trim()) {
      castArray = cast.split(',').map((c) => c.trim()).filter(Boolean);
    }

    const movie = await Movie.create({
      title: title.trim(),
      description: description.trim(),
      poster: poster.trim(),
      banner: banner ? banner.trim() : poster.trim(),
      genre: genreArray,
      duration: Math.max(1, Number(duration)),
      rating: rating ? Math.min(10, Math.max(0, Number(rating))) : 8.0,
      language: language || 'English',
      ticketPrice: Math.max(50, Number(ticketPrice) || 250),
      showtimes: showtimeArray,
      featured: Boolean(featured),
      director: director ? director.trim() : '',
      cast: castArray,
      trailerUrl: trailerUrl ? trailerUrl.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Movie added successfully to cinema catalog',
      movie,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create movie',
      error: error.message,
    });
  }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Format genre if provided as string
    if (typeof updateData.genre === 'string') {
      updateData.genre = updateData.genre.split(',').map((g) => g.trim()).filter(Boolean);
    }

    // Format showtimes if provided as string
    if (typeof updateData.showtimes === 'string') {
      updateData.showtimes = updateData.showtimes.split(',').map((s) => s.trim()).filter(Boolean);
    }

    // Format cast if provided as string
    if (typeof updateData.cast === 'string') {
      updateData.cast = updateData.cast.split(',').map((c) => c.trim()).filter(Boolean);
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie details updated successfully',
      movie,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update movie',
      error: error.message,
    });
  }
};

// @desc    Delete a movie (with active booking safety guard)
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // Safety check: Check if movie has active reservations
    const activeBookingsCount = await Booking.countDocuments({
      movie: req.params.id,
      paymentStatus: { $ne: 'Cancelled' },
    });

    if (activeBookingsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete "${movie.title}" because it currently has ${activeBookingsCount} active customer booking(s). Please cancel or archive the active reservations first.`,
        activeBookingsCount,
      });
    }

    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `"${movie.title}" deleted successfully from cinema catalog`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete movie',
      error: error.message,
    });
  }
};

module.exports = {
  getAllMovies,
  getFeaturedMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
