const mongoose = require('mongoose');

const DocumentMetadataSchema = new mongoose.Schema({
  documentId: {
    type: String,
    required: true,
    unique: true
  },
  applicationId: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
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
  uploadedBy: {
    type: String,
    required: true,
    lowercase: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DocumentMetadata', DocumentMetadataSchema);
