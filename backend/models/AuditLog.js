const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'FARMER_REGISTERED',
      'SCHEME_CREATED',
      'SCHEME_STATUS_UPDATED',
      'APPLICATION_SUBMITTED',
      'DOCUMENT_UPLOADED',
      'APPLICATION_VERIFIED',
      'APPLICATION_APPROVED',
      'APPLICATION_REJECTED',
      'ON_CHAIN_RECORDED'
    ]
  },
  actorWallet: {
    type: String,
    required: true,
    lowercase: true
  },
  details: {
    type: String,
    default: ''
  },
  txHash: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
