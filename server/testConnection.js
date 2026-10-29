const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const testMongoConnection = async () => {
  const uri = process.env.MONGO_URI;

  console.log('\n--- MongoDB Connection Test ---');
  if (!uri || !uri.trim()) {
    console.error('❌ Error: MONGO_URI is missing or empty in server/.env');
    process.exit(1);
  }

  // Check for common unreplaced placeholders
  if (uri.includes('<YOUR_PASSWORD>') || uri.includes('<password>')) {
    console.error('❌ Please replace the password placeholder in server/.env with your actual MongoDB Atlas password.');
    process.exit(1);
  }

  if (uri.includes('<YOUR_CLUSTER>')) {
    console.error('❌ Please replace the cluster placeholder in server/.env with your MongoDB Atlas cluster hostname.');
    process.exit(1);
  }

  console.log('Attempting connection to MongoDB Atlas...');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 6000,
    });

    console.log('✅ Connection Successful!');
    console.log(`   Cluster Host: ${conn.connection.host}`);
    console.log(`   Database:     ${conn.connection.name}`);
    console.log(`   Ready State:  Connected\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    // Sanitize any potential URI in error message to guarantee no credentials leak
    const safeMsg = error.message.replace(/:\/\/[^@]+@/, '://***:***@');
    console.error(`❌ Connection Failed: ${safeMsg}\n`);

    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('👉 Tip: Check your Atlas database username and password in server/.env.');
    } else if (error.message.includes('queryTxt ETIMEOUT') || error.message.includes('ENOTFOUND')) {
      console.error('👉 Tip: Check your cluster hostname and internet connection.');
    } else if (error.message.includes('Server selection timed out')) {
      console.error('👉 Tip: Ensure your IP address is whitelisted in MongoDB Atlas Network Access (e.g. 0.0.0.0/0).');
    }
    process.exit(1);
  }
};

testMongoConnection();
