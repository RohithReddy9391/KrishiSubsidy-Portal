const Application = require('../models/Application');
const AuditService = require('../services/auditService');
const { memoryApplications } = require('./farmerController');

const getPendingApplications = async (req, res, next) => {
  try {
    let pendingApps = [];
    try {
      pendingApps = await Application.find({}).sort({ createdAt: -1 });
    } catch (err) {
      pendingApps = Array.from(memoryApplications.values());
    }

    res.status(200).json({
      count: pendingApps.length,
      applications: pendingApps
    });
  } catch (error) {
    next(error);
  }
};

const getOfficerApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let application = null;

    try {
      application = await Application.findOne({ applicationId: id });
    } catch (err) {
      application = memoryApplications.get(id);
    }

    if (!application) {
      return res.status(404).json({ error: 'NotFound', message: `Application ${id} not found` });
    }

    res.status(200).json({ application });
  } catch (error) {
    next(error);
  }
};

const verifyApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { txHash, blockNumber } = req.body;
    const officerWallet = (req.body.officerWallet || '0x0000000000000000000000000000000000000000').toLowerCase();

    let application = null;
    try {
      application = await Application.findOne({ applicationId: id });
    } catch (err) {
      application = memoryApplications.get(id);
    }

    if (!application) {
      return res.status(404).json({ error: 'NotFound', message: `Application ${id} not found` });
    }

    // Strict State Transition Enforcement
    if (application.status === 'VERIFIED' || application.status === 'APPROVED') {
      if (txHash && (!application.txHash || application.txHash.startsWith('Already'))) {
        application.txHash = txHash;
      }
      return res.status(200).json({
        message: `Application ${id} is already in ${application.status} status`,
        application
      });
    }

    if (application.status !== 'PENDING') {
      return res.status(400).json({
        error: 'InvalidStateTransition',
        message: `Application must be in PENDING status to be verified. Current status is ${application.status}.`
      });
    }

    application.status = 'VERIFIED';
    application.paymentStatus = 'PENDING_APPROVAL';
    application.verifiedByOfficer = officerWallet;
    if (txHash) application.txHash = txHash;
    if (blockNumber) application.blockNumber = blockNumber;
    application.updatedAt = new Date();

    try {
      await Application.updateOne(
        { applicationId: id },
        { status: 'VERIFIED', paymentStatus: 'PENDING_APPROVAL', verifiedByOfficer: officerWallet, txHash, blockNumber, updatedAt: new Date() }
      );
    } catch (err) {
      memoryApplications.set(id, application);
    }

    await AuditService.logEvent({
      applicationId: id,
      action: 'APPLICATION_VERIFIED',
      actorWallet: officerWallet,
      details: `Officer verified application on smart contract. Tx: ${txHash || 'N/A'}`,
      txHash: txHash || null
    });

    res.status(200).json({
      message: `Application ${id} status updated to VERIFIED`,
      application
    });
  } catch (error) {
    next(error);
  }
};

const approveApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { txHash, blockNumber } = req.body;
    const officerWallet = (req.body.officerWallet || '0x0000000000000000000000000000000000000000').toLowerCase();

    let application = null;
    try {
      application = await Application.findOne({ applicationId: id });
    } catch (err) {
      application = memoryApplications.get(id);
    }

    if (!application) {
      return res.status(404).json({ error: 'NotFound', message: `Application ${id} not found` });
    }

    // Strict State Transition Enforcement: Must be VERIFIED first!
    if (application.status === 'APPROVED') {
      if (txHash && (!application.txHash || application.txHash.startsWith('Already'))) {
        application.txHash = txHash;
      }
      return res.status(200).json({
        message: `Application ${id} is already APPROVED (Payment Status: Approved – Payment Pending)`,
        application
      });
    }

    if (application.status !== 'VERIFIED') {
      return res.status(400).json({
        error: 'InvalidStateTransition',
        message: `Application must be VERIFIED before it can be APPROVED. Current status is ${application.status}.`
      });
    }

    // Correct Payment Workflow: Officer Approval sets paymentStatus to APPROVED_PAYMENT_PENDING
    // (Payment Released represents external DBT process)
    application.status = 'APPROVED';
    application.paymentStatus = 'APPROVED_PAYMENT_PENDING';
    application.verifiedByOfficer = officerWallet;
    if (txHash) application.txHash = txHash;
    if (blockNumber) application.blockNumber = blockNumber;
    application.updatedAt = new Date();

    try {
      await Application.updateOne(
        { applicationId: id },
        { status: 'APPROVED', paymentStatus: 'APPROVED_PAYMENT_PENDING', verifiedByOfficer: officerWallet, txHash, blockNumber, updatedAt: new Date() }
      );
    } catch (err) {
      memoryApplications.set(id, application);
    }

    await AuditService.logEvent({
      applicationId: id,
      action: 'APPLICATION_APPROVED',
      actorWallet: officerWallet,
      details: `Application approved on-chain by officer. Payment Status set to Approved – Payment Pending. On-chain Tx: ${txHash || 'Pending MetaMask Sign'}`,
      txHash: txHash || null
    });

    res.status(200).json({
      message: `Application ${id} APPROVED successfully (Payment Status: Approved – Payment Pending)`,
      application
    });
  } catch (error) {
    next(error);
  }
};

const rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason, officerWallet } = req.body;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({ error: 'ValidationError', message: 'Rejection reason is required' });
    }

    const formattedOfficer = (officerWallet || '0x0000000000000000000000000000000000000000').toLowerCase();

    let application = null;
    try {
      application = await Application.findOne({ applicationId: id });
    } catch (err) {
      application = memoryApplications.get(id);
    }

    if (!application) {
      return res.status(404).json({ error: 'NotFound', message: `Application ${id} not found` });
    }

    if (application.status !== 'PENDING' && application.status !== 'VERIFIED') {
      return res.status(400).json({
        error: 'InvalidStateTransition',
        message: `Cannot reject application in status ${application.status}`
      });
    }

    application.status = 'REJECTED';
    application.paymentStatus = 'NOT_ELIGIBLE';
    application.rejectionReason = rejectionReason;
    application.verifiedByOfficer = formattedOfficer;
    application.updatedAt = new Date();

    try {
      await Application.updateOne(
        { applicationId: id },
        { status: 'REJECTED', paymentStatus: 'NOT_ELIGIBLE', rejectionReason, verifiedByOfficer: formattedOfficer, updatedAt: new Date() }
      );
    } catch (err) {
      memoryApplications.set(id, application);
    }

    await AuditService.logEvent({
      applicationId: id,
      action: 'APPLICATION_REJECTED',
      actorWallet: formattedOfficer,
      details: `Application rejected. Reason: ${rejectionReason}`
    });

    res.status(200).json({
      message: `Application ${id} REJECTED`,
      application
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingApplications,
  getOfficerApplicationById,
  verifyApplication,
  approveApplication,
  rejectApplication
};
