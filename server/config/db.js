const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000, // 15s timeout for cloud container cold starts
    });

    console.log(`[MongoDB] Connected successfully to Atlas host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    // Sanitize any credential URI before logging
    const safeError = error.message.replace(/:\/\/[^@]+@/, '://***:***@');
    console.error(`[MongoDB Error] Connection failed: ${safeError}`);
    throw error;
  }
};

module.exports = connectDB;
