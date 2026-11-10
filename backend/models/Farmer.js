const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema({
  farmerId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  walletAddress: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  landAreaAcres: {
    type: Number,
    required: true,
    min: 0.1
  },
  isIncomeTaxPayee: {
    type: Boolean,
    default: false
  },
  annualIncomeINR: {
    type: Number,
    default: 120000
  },
  pattadarPassbookNumber: {
    type: String,
    default: 'AP-WEBLAND-PASSBOOK-99',
    trim: true
  },
  farmerCategory: {
    type: String,
    enum: ['SMALL_MARGINAL', 'TENANT_CCTA', 'SC_ST', 'GENERAL'],
    default: 'SMALL_MARGINAL'
  },
  surveyNumber: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    district: { type: String, default: 'Guntur' },
    state: { type: String, default: 'Andhra Pradesh' },
    pincode: { type: String, default: '522002' }
  },
  primaryCrops: [{
    type: String,
    trim: true
  }],
  isVerified: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Farmer', FarmerSchema);
