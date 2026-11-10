const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config();

const connectDB = require('./config/db');
const blockchainService = require('./services/blockchainService');
const errorHandler = require('./middleware/errorHandler');

const farmerRoutes = require('./routes/farmerRoutes');
const officerRoutes = require('./routes/officerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded document files securely
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API Routes
app.use('/api', farmerRoutes);
app.use('/api', officerRoutes);
app.use('/api', adminRoutes);
app.use('/api', verificationRoutes);
app.use('/api/payments', paymentRoutes);

// Health Status Endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Pending/Offline (Fallback Mode Active)';
  res.status(200).json({
    status: 'online',
    service: 'Farmer Subsidy Backend API',
    database: dbStatus,
    blockchain: blockchainService.initialized ? 'Connected' : 'Pending/Offline',
    contractAddress: blockchainService.contractAddress || 'Not Configured',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handling Middleware
app.use(errorHandler);

// Initialize DB and Blockchain Connections before listening
const startServer = async () => {
  await connectDB();
  await blockchainService.init();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Farmer Subsidy Backend Server running on port ${PORT}`);
    console.log(` Local RPC URL: ${process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545'}`);
    console.log(` Contract Address: ${blockchainService.contractAddress || 'Pending Deployment'}`);
    console.log(`=======================================================`);
  });
};

startServer();

module.exports = app;
