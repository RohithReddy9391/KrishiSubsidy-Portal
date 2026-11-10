const express = require('express');
const router = express.Router();
const officerController = require('../controllers/officerController');

router.get('/officer/applications/pending', officerController.getPendingApplications);
router.get('/officer/applications/:id', officerController.getOfficerApplicationById);
router.post('/officer/applications/:id/verify', officerController.verifyApplication);
router.post('/officer/applications/:id/approve', officerController.approveApplication);
router.post('/officer/applications/:id/reject', officerController.rejectApplication);

module.exports = router;
