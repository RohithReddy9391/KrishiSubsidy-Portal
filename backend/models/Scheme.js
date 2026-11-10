const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  schemeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  subsidyAmount: {
    type: Number,
    required: true,
    min: 1
  },
  state: {
    type: String,
    default: 'Andhra Pradesh',
    trim: true
  },
  category: {
    type: String,
    enum: ['STATE_AP', 'CENTRAL_NATIONAL'],
    default: 'STATE_AP'
  },
  minLandArea: {
    type: Number,
    default: 0
  },
  maxLandArea: {
    type: Number,
    default: 5.0
  },
  isIncomeTaxPayeeAllowed: {
    type: Boolean,
    default: false
  },
  maxAnnualIncome: {
    type: Number,
    default: 250000
  },
  pattadarRequired: {
    type: Boolean,
    default: true
  },
  allowedCrops: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scheme', SchemeSchema);
