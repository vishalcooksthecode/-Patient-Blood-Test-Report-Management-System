const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    heartbeatFrequencyMS: 10000,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
  });
  console.log(`MongoDB Connected: ${conn.connection.host}`);

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected! Reconnecting...');
    setTimeout(() => mongoose.connect(process.env.MONGO_URI), 5000);
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message);
  });
};

module.exports = connectDB;
