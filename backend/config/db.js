const mongoose = require('mongoose');

/**
 * Connects backend to MongoDB Atlas
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI || mongoURI.trim() === '' || mongoURI.includes('<PASSWORD>')) {
    console.error('================================================================');
    console.error(' [DB CONFIG ERROR] MONGODB_URI contains placeholder <PASSWORD>.');
    console.error(' Please edit backend/.env and replace <PASSWORD> with your Atlas password.');
    console.error('================================================================');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('================================================================');
    console.log(` SUCCESS: Connected to MongoDB Atlas Cluster!`);
    console.log(` Host: ${conn.connection.host}`);
    console.log(` Database: ${conn.connection.name}`);
    console.log('================================================================');
    return true;
  } catch (error) {
    console.error('================================================================');
    console.error(` ERROR: Failed to connect to MongoDB Atlas: ${error.message}`);
    console.error(' Please check:');
    console.error(' 1. Your database password in backend/.env');
    console.error(' 2. MongoDB Atlas Network Access IP Whitelist (Add 0.0.0.0/0 in Atlas Console)');
    console.error('================================================================');
    mongoose.set('bufferCommands', false);
    return false;
  }
};

module.exports = connectDB;
