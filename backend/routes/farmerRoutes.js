const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const schemeController = require('../controllers/schemeController');
const { upload, attachDocumentHash } = require('../middleware/upload');

// Farmer Registration
router.post('/farmers/register', farmerController.registerFarmer);

// Scheme Explorer
router.get('/schemes', schemeController.getSchemes);

// Application Submission (with document upload & SHA-256 hashing)
router.post('/applications', upload.single('document'), attachDocumentHash, farmerController.submitApplication);

// On-Chain Application Pre-Seeding
router.post('/applications/:id/ensure-onchain', farmerController.ensureApplicationOnChain);

// Single Application View
router.get('/applications/:id', farmerController.getApplicationById);

// Reset All Applications (Start Fresh)
router.delete('/applications/reset-all', farmerController.clearAllApplications);
router.post('/applications/reset-all', farmerController.clearAllApplications);

module.exports = router;

