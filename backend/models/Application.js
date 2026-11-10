const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  farmerWallet: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: false
  },
  schemeId: {
    type: String,
    required: true,
    trim: true
  },
  subsidyAmount: {
    type: Number,
    required: true
  },
  landAreaAcres: {
    type: Number,
    default: 0
  },
  isIncomeTaxPayee: {
    type: Boolean,
    default: false
  },
  annualIncomeINR: {
    type: Number,
    default: 0
  },
  pattadarPassbookNumber: {
    type: String,
    default: '',
    trim: true
  },
  isEligible: {
    type: Boolean,
    default: true
  },
  eligibilityReason: {
    type: String,
    default: ''
  },
  documentHash: {
    type: String,
    required: true,
    trim: true
  },
  ipfsCid: {
    type: String,
    default: null,
    trim: true
  },
  ipfsGatewayUrl: {
    type: String,
    default: null
  },
  documentFileName: {
    type: String,
    required: true
  },
  documentPath: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  paymentStatus: {
    type: String,
    enum: [
      'NOT_ELIGIBLE',
      'PENDING_APPROVAL',
      'APPROVED_PAYMENT_PENDING',
      'PAYMENT_PROCESSING',
      'PAYMENT_RELEASED',
      'PAYMENT_FAILED'
    ],
    default: 'PENDING_APPROVAL'
  },
  utrReference: {
    type: String,
    default: null
  },
  paymentProcessedAt: {
    type: Date,
    default: null
  },
  verifiedByOfficer: {
    type: String,
    default: null
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  txHash: {
    type: String,
    default: null
  },
  blockNumber: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Tier 1 Duplicate Prevention Compound Index
ApplicationSchema.index({ farmerWallet: 1, schemeId: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
