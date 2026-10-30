const mongoose = require('mongoose');

// Helper to clean formatting and expand mongodb+srv URI to direct shard seeds
const resolveMongoUri = (rawUri) => {
  let uri = (rawUri || '').trim().replace(/^["']|["']$/g, '');

  // Strip accidental angle brackets around password if present (e.g. :<password>@ -> :password@)
  uri = uri.replace(/:<([^>]+)>@/, function (m, p) {
    return ':' + p + '@';
  });

  if (uri.startsWith('mongodb+srv://') && uri.includes('cluster0.wfe6x5k.mongodb.net')) {
    const directSeed = uri
      .replace('mongodb+srv://', 'mongodb://')
      .replace(
        'cluster0.wfe6x5k.mongodb.net',
        'ac-ighhr0h-shard-00-00.wfe6x5k.mongodb.net:27017,ac-ighhr0h-shard-00-01.wfe6x5k.mongodb.net:27017,ac-ighhr0h-shard-00-02.wfe6x5k.mongodb.net:27017'
      );
    const hasQuery = directSeed.includes('?');
    const params = [];
    if (!directSeed.includes('ssl=')) params.push('ssl=true');
    if (!directSeed.includes('replicaSet=')) params.push('replicaSet=atlas-x9gq7k-shard-0');
    if (!directSeed.includes('authSource=')) params.push('authSource=admin');

    if (params.length > 0) {
      return directSeed + (hasQuery ? '&' : '?') + params.join('&');
    }
    return directSeed;
  }

  return uri;
};

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!rawUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const resolvedUri = resolveMongoUri(rawUri);

    const conn = await mongoose.connect(resolvedUri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`[MongoDB] Connected successfully to Atlas host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    const safeError = error.message.replace(/:\/\/[^@]+@/, '://***:***@');
    console.error(`[MongoDB Error] Connection failed: ${safeError}`);
    throw new Error(safeError);
  }
};

module.exports = connectDB;
