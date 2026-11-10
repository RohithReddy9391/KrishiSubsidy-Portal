const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/admin/schemes', adminController.createScheme);
router.patch('/admin/schemes/:id/status', adminController.updateSchemeStatus);
router.get('/admin/statistics', adminController.getStatistics);

module.exports = router;
