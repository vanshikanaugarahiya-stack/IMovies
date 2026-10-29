const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'IMovies Backend API is running successfully!',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the IMovies API Server');
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url} - Endpoint not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`[Server] IMovies backend listening on http://localhost:${PORT}`);
});

// Connect to MongoDB with automated, collision-safe retry loop
let retryTimer = null;
let isShuttingDown = false;

const startDBConnection = async () => {
  if (isShuttingDown) return;

  // Prevent duplicate connection attempts if already connected or in-flight
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  try {
    await connectDB();
  } catch (err) {
    if (isShuttingDown) return;
    console.warn('[Server] MongoDB connection attempt failed. Retrying in 10 seconds...');
    retryTimer = setTimeout(startDBConnection, 10000);
  }
};

startDBConnection();

// Graceful shutdown handling for cloud containers (Render SIGTERM / SIGINT)
const gracefulShutdown = async (signal) => {
  console.log(`[Server] Received ${signal}. Cleaning up resources...`);
  isShuttingDown = true;

  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
      console.log('[MongoDB] Connection closed gracefully.');
    }
    process.exit(0);
  } catch (err) {
    console.error('[Server Error] Error during graceful shutdown:', err.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
