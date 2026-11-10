const Application = require('../models/Application');
const AuditService = require('../services/auditService');
const { memoryApplications } = require('./farmerController');

/**
 * Payment Controller — Simulated On-Chain Subsidy Payment Release
 */
const processDBTPayment = async (req, res, next) => {
  try {
    let { applicationId, txHash, releasedBy } = req.body;

    if (typeof applicationId === 'object' && applicationId !== null) {
      txHash = applicationId.txHash || txHash;
      releasedBy = applicationId.releasedBy || releasedBy;
      applicationId = applicationId.applicationId;
    }

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'applicationId is required'
      });
    }

    // 1. Fetch Application Record
    let application = null;
    try {
      application = await Application.findOne({ applicationId });
    } catch (err) {
      application = memoryApplications.get(applicationId);
    }

    if (!application && memoryApplications.has(applicationId)) {
      application = memoryApplications.get(applicationId);
    }

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: `Application ${applicationId} not found`
      });
    }

    // 2. Validate Application Status: Must be APPROVED!
    if (application.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: 'InvalidPaymentState',
        message: `Payment can only be released for APPROVED applications. Current status is ${application.status}.`
      });
    }

    // 3. Prevent Duplicate Payment Releases - Idempotent response
    if (application.paymentStatus === 'PAYMENT_RELEASED') {
      return res.status(200).json({
        success: true,
        applicationId,
        paymentStatus: 'PAYMENT_RELEASED',
        subsidyAmount: application.subsidyAmount || 5000,
        utrReference: application.utrReference || 'SIM-DBT-2026-RELEASED',
        paymentProcessedAt: application.paymentProcessedAt ? application.paymentProcessedAt.toISOString() : new Date().toISOString(),
        txHash: application.paymentTxHash || txHash || application.txHash,
        releasedBy: application.releasedByWallet || releasedBy,
        message: `Simulated subsidy payment has already been released for application ${applicationId} (Simulated DBT Reference: ${application.utrReference}).`
      });
    }

    if (application.paymentStatus === 'NOT_ELIGIBLE') {
      return res.status(400).json({
        success: false,
        error: 'InvalidPaymentState',
        message: `Application ${applicationId} is marked as NOT_ELIGIBLE for payment.`
      });
    }

    // 4. Generate Simulated DBT Reference Number (e.g. SIM-DBT-2026-8947291)
    const randomDigits = Math.floor(1000000 + Math.random() * 9000000);
    const utrReference = `SIM-DBT-2026-${randomDigits}`;
    const paymentProcessedAt = new Date();
    const finalTxHash = txHash || application.txHash || null;
    const finalReleasedBy = releasedBy || '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';

    // 5. Update Application State to PAYMENT_RELEASED
    application.paymentStatus = 'PAYMENT_RELEASED';
    application.utrReference = utrReference;
    application.paymentProcessedAt = paymentProcessedAt;
    application.paymentTxHash = finalTxHash;
    application.releasedByWallet = finalReleasedBy;
    application.updatedAt = new Date();

    try {
      await Application.updateOne(
        { applicationId },
        {
          paymentStatus: 'PAYMENT_RELEASED',
          utrReference,
          paymentProcessedAt,
          paymentTxHash: finalTxHash,
          releasedByWallet: finalReleasedBy,
          updatedAt: new Date()
        }
      );
    } catch (err) {
      memoryApplications.set(applicationId, application);
    }

    // 6. Audit Trail Logging
    await AuditService.logEvent({
      applicationId,
      action: 'PAYMENT_RELEASED',
      actorWallet: finalReleasedBy,
      details: `Simulated On-Chain Subsidy Payment released. Simulated DBT Reference: ${utrReference}`,
      txHash: finalTxHash
    });

    // 7. Success Response
    res.status(200).json({
      success: true,
      applicationId,
      paymentStatus: 'PAYMENT_RELEASED',
      subsidyAmount: application.subsidyAmount || 5000,
      utrReference,
      paymentProcessedAt: paymentProcessedAt.toISOString(),
      txHash: finalTxHash,
      releasedBy: finalReleasedBy,
      message: 'Simulated On-Chain Subsidy Payment released successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processDBTPayment
};
