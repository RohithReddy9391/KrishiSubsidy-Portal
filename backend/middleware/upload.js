const multer = require('multer');
const path = require('path');
const fs = require('fs');
const HashService = require('../services/hashService');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * Middleware that attaches computed SHA-256 document hash to req.documentHash
 */
const attachDocumentHash = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const documentHash = HashService.computeFileHash(filePath);
    req.documentHash = documentHash;
    console.log(`Document uploaded: ${req.file.originalname} -> SHA-256 Hash: ${documentHash}`);
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Document Hashing Error',
      message: 'Failed to compute SHA-256 document hash'
    });
  }
};

module.exports = {
  upload,
  attachDocumentHash
};
