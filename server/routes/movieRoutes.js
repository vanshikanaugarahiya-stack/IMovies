const express = require('express');
const router = express.Router();
const {
  getAllMovies,
  getFeaturedMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllMovies);
router.get('/featured', getFeaturedMovies);
router.get('/:id', getMovieById);

// Admin-only routes
router.post('/', verifyToken, verifyAdmin, createMovie);
router.put('/:id', verifyToken, verifyAdmin, updateMovie);
router.delete('/:id', verifyToken, verifyAdmin, deleteMovie);

module.exports = router;
