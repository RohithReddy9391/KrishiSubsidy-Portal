const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');

router.get('/verification/:applicationId', verificationController.verifyApplicationPublic);

module.exports = router;
