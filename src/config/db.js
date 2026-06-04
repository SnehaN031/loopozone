const mongoose = require('mongoose');

const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI;
  
  if (!dbUri) {
    console.error('CRITICAL ERROR: MONGODB_URI environment variable is required.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(dbUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`CRITICAL DATABASE ERROR: Failed to connect to primary database: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error(`MongoDB disconnection error: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
