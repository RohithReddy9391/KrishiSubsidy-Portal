const Application = require('../models/Application');
const DocumentMetadata = require('../models/DocumentMetadata');
const blockchainService = require('../services/blockchainService');
const AuditService = require('../services/auditService');
const { memoryApplications } = require('./farmerController');

/**
 * Public Verification Endpoint Controller
 */
const verifyApplicationPublic = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({ error: 'ValidationError', message: 'applicationId is required' });
    }

    // 1. Fetch Off-Chain MongoDB Record
    let dbRecord = null;
    try {
      dbRecord = await Application.findOne({ applicationId });
    } catch (err) {
      dbRecord = memoryApplications.get(applicationId);
    }

    if (!dbRecord && memoryApplications.has(applicationId)) {
      dbRecord = memoryApplications.get(applicationId);
    }

    // 2. Fetch On-Chain Blockchain Record
    const onChainRecord = await blockchainService.getApplication(applicationId);

    if (!dbRecord && !onChainRecord) {
      return res.status(404).json({
        error: 'NotFound',
        message: `No off-chain or on-chain records found for Application ID: ${applicationId}`
      });
    }

    // 3. Fetch Audit Trail Logs
    const auditTrail = await AuditService.getLogs(applicationId);

    // 4. Compare Document Hashes
    const dbHash = dbRecord ? dbRecord.documentHash : null;
    const chainHash = onChainRecord ? onChainRecord.documentHash : null;
    const isIntegrityVerified = dbHash && chainHash ? (dbHash.toLowerCase() === chainHash.toLowerCase()) : (dbHash || chainHash ? true : false);

    const formatPaymentStatus = (rec) => {
      if (!rec) return 'PENDING_APPROVAL';
      if (rec.paymentStatus) return rec.paymentStatus;
      if (rec.status === 'APPROVED') return 'APPROVED_PAYMENT_PENDING';
      if (rec.status === 'REJECTED') return 'NOT_ELIGIBLE';
      return 'PENDING_APPROVAL';
    };

    res.status(200).json({
      applicationId,
      verificationStatus: 'SUCCESS',
      isIntegrityVerified,
      offChainRecord: dbRecord ? {
        applicationId: dbRecord.applicationId,
        farmerWallet: dbRecord.farmerWallet,
        schemeId: dbRecord.schemeId,
        subsidyAmount: dbRecord.subsidyAmount,
        landAreaAcres: dbRecord.landAreaAcres,
        isIncomeTaxPayee: dbRecord.isIncomeTaxPayee,
        annualIncomeINR: dbRecord.annualIncomeINR,
        pattadarPassbookNumber: dbRecord.pattadarPassbookNumber,
        isEligible: dbRecord.isEligible !== undefined ? dbRecord.isEligible : true,
        eligibilityReason: dbRecord.eligibilityReason || '',
        status: dbRecord.status,
        paymentStatus: formatPaymentStatus(dbRecord),
        documentFileName: dbRecord.documentFileName,
        documentHash: dbRecord.documentHash,
        ipfsCid: dbRecord.ipfsCid,
        ipfsGatewayUrl: dbRecord.ipfsGatewayUrl,
        utrReference: dbRecord.utrReference,
        rejectionReason: dbRecord.rejectionReason,
        createdAt: dbRecord.createdAt
      } : null,
      onChainRecord: onChainRecord ? {
        applicationId: onChainRecord.applicationId,
        farmerWallet: onChainRecord.farmerWallet,
        schemeId: onChainRecord.schemeId,
        subsidyAmount: onChainRecord.subsidyAmount,
        documentHash: onChainRecord.documentHash,
        statusEnum: onChainRecord.status, // 0: PENDING, 1: VERIFIED, 2: APPROVED, 3: REJECTED
        statusText: ['PENDING', 'VERIFIED', 'APPROVED', 'REJECTED'][onChainRecord.status] || 'UNKNOWN',
        timestamp: new Date(onChainRecord.timestamp * 1000).toISOString(),
        verifiedByOfficer: onChainRecord.verifiedByOfficer
      } : 'No on-chain record found (Pending MetaMask on-chain submission)',
      auditTrail
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyApplicationPublic
};
