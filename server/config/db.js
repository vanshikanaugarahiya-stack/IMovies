const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in server/.env file');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5s timeout for fast feedback
    });

    console.log(`[MongoDB] Connected successfully to Atlas host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
