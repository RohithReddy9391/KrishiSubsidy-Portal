const express = require('express');
const router = express.Router();
const { processDBTPayment } = require('../controllers/paymentController');

// POST /api/payments/process-dbt — Simulated Direct Benefit Transfer Endpoint
router.post('/process-dbt', processDBTPayment);

module.exports = router;
