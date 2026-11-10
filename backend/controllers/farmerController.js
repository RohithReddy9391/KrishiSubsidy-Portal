const Farmer = require('../models/Farmer');
const Application = require('../models/Application');
const Scheme = require('../models/Scheme');
const DocumentMetadata = require('../models/DocumentMetadata');
const ipfsService = require('../services/ipfsService');
const blockchainService = require('../services/blockchainService');
const AuditService = require('../services/auditService');

// In-Memory Fallback Storage (Clean slate - no pre-seeded applications)
const memoryFarmers = new Map();
const memoryApplications = new Map();

const clearAllApplications = async (req, res, next) => {
  try {
    memoryApplications.clear();
    try {
      await Application.deleteMany({});
    } catch (err) {}
    res.status(200).json({ message: 'All applications cleared successfully. Starting fresh.' });
  } catch (error) {
    next(error);
  }
};



const registerFarmer = async (req, res, next) => {
  try {
    const { farmerWallet, name, district, state, farmerCategory, landAreaAcres, pattadarPassbookNumber, isIncomeTaxPayee, annualIncomeINR } = req.body;

    if (!farmerWallet) {
      return res.status(400).json({ error: 'ValidationError', message: 'Farmer Web3 wallet address is required' });
    }

    const formattedWallet = farmerWallet.toLowerCase();
    const farmerData = {
      farmerWallet: formattedWallet,
      name: name || 'Registered AP Farmer',
      district: district || 'Guntur',
      state: state || 'Andhra Pradesh',
      farmerCategory: farmerCategory || 'SMALL_MARGINAL',
      landAreaAcres: parseFloat(landAreaAcres) || 2.5,
      pattadarPassbookNumber: pattadarPassbookNumber || 'AP-WEBLAND-PASSBOOK-5884',
      isIncomeTaxPayee: Boolean(isIncomeTaxPayee),
      annualIncomeINR: parseFloat(annualIncomeINR) || 120000,
      createdAt: new Date()
    };

    try {
      const farmerDoc = await Farmer.findOneAndUpdate(
        { farmerWallet: formattedWallet },
        farmerData,
        { upsert: true, new: true }
      );
      return res.status(200).json({ message: 'Farmer profile registered successfully', farmer: farmerDoc });
    } catch (err) {
      memoryFarmers.set(formattedWallet, farmerData);
      return res.status(200).json({ message: 'Farmer profile registered in memory fallback', farmer: farmerData });
    }
  } catch (error) {
    next(error);
  }
};

const checkDuplicateClaim = async (farmerWallet, schemeId, documentHash) => {
  try {
    const existingWalletClaim = await Application.findOne({
      farmerWallet,
      schemeId,
      status: { $in: ['PENDING', 'VERIFIED', 'APPROVED'] }
    });

    if (existingWalletClaim) {
      return {
        isDuplicate: true,
        tier: 1,
        reason: `Duplicate claim detected! Wallet ${farmerWallet} has already submitted an active application (${existingWalletClaim.applicationId}) for scheme ${schemeId}.`
      };
    }

    const existingDocClaim = await Application.findOne({
      documentHash,
      status: { $in: ['PENDING', 'VERIFIED', 'APPROVED'] }
    });

    if (existingDocClaim) {
      return {
        isDuplicate: true,
        tier: 2,
        reason: `Duplicate document detected! This land survey document (Hash: ${documentHash.slice(0, 16)}...) has already been used in application ${existingDocClaim.applicationId}.`
      };
    }

    return { isDuplicate: false };
  } catch (err) {
    const memApps = Array.from(memoryApplications.values());
    const dupWallet = memApps.find(a => a.farmerWallet === farmerWallet && a.schemeId === schemeId && ['PENDING', 'VERIFIED', 'APPROVED'].includes(a.status));
    if (dupWallet) {
      return { isDuplicate: true, tier: 1, reason: `Duplicate claim detected for wallet in memory!` };
    }
    const dupDoc = memApps.find(a => a.documentHash === documentHash && ['PENDING', 'VERIFIED', 'APPROVED'].includes(a.status));
    if (dupDoc) {
      return { isDuplicate: true, tier: 2, reason: `Duplicate document hash detected in memory!` };
    }
    return { isDuplicate: false };
  }
};

const evaluateAPPolicyEligibility = (scheme, landArea, isITPayee, annualIncome) => {
  const maxLand = scheme ? (scheme.maxLandArea || 5.0) : 5.0;
  const isITAllowed = scheme ? scheme.isIncomeTaxPayeeAllowed : false;
  const maxIncome = scheme ? (scheme.maxAnnualIncome || 250000) : 250000;

  const acres = parseFloat(landArea || 0);
  const income = parseFloat(annualIncome || 0);

  if (acres > maxLand) {
    return {
      isEligible: false,
      reason: `INELIGIBLE: Registered land size (${acres} acres) exceeds the maximum scheme threshold of ${maxLand} acres for small/marginal farmers.`
    };
  }

  if (!isITAllowed && isITPayee) {
    return {
      isEligible: false,
      reason: `INELIGIBLE: Income Tax Payees are strictly excluded from state welfare subsidy assistance under Government of Andhra Pradesh guidelines.`
    };
  }

  if (income > maxIncome) {
    return {
      isEligible: false,
      reason: `INELIGIBLE: Annual household income (₹${income.toLocaleString()}) exceeds the maximum state welfare cap of ₹${maxIncome.toLocaleString()}.`
    };
  }

  return {
    isEligible: true,
    reason: `✓ ELIGIBLE: Meets Andhra Pradesh land possession (${acres} acres ≤ ${maxLand} acres), Income Tax payee exclusion, and annual income rules.`
  };
};

const submitApplication = async (req, res, next) => {
  try {
    const { farmerWallet, schemeId, landAreaAcres, isIncomeTaxPayee, annualIncomeINR, pattadarPassbookNumber } = req.body;

    if (!farmerWallet || !schemeId) {
      return res.status(400).json({ error: 'ValidationError', message: 'farmerWallet and schemeId are required fields' });
    }

    if (!req.file || !req.documentHash) {
      return res.status(400).json({ error: 'ValidationError', message: 'Supporting land proof document is required' });
    }

    const formattedWallet = farmerWallet.toLowerCase();

    let targetScheme = null;
    try {
      targetScheme = await Scheme.findOne({ schemeId });
    } catch (err) {}

    const inputLandArea = parseFloat(landAreaAcres) || 2.5;
    const inputITPayee = isIncomeTaxPayee === 'true' || isIncomeTaxPayee === true;
    const inputIncome = parseFloat(annualIncomeINR) || 120000;
    const inputPassbook = pattadarPassbookNumber || 'AP-WEBLAND-PASSBOOK-5884';

    const { isEligible, reason: eligibilityReason } = evaluateAPPolicyEligibility(targetScheme, inputLandArea, inputITPayee, inputIncome);
    const subsidyAmount = targetScheme ? targetScheme.subsidyAmount : 5000;

    const duplicateStatus = await checkDuplicateClaim(formattedWallet, schemeId, req.documentHash);
    if (duplicateStatus.isDuplicate) {
      return res.status(400).json({
        error: 'DuplicateApplicationError',
        message: duplicateStatus.reason,
        tier: duplicateStatus.tier
      });
    }

    const applicationId = `APP-${Date.now().toString().slice(-6)}`;
    const documentHash = req.documentHash;

    const ipfsResult = await ipfsService.uploadDocumentToIPFS(req.file.path, req.file.originalname);
    if (!ipfsResult.success) {
      return res.status(500).json({
        error: 'IPFSUploadError',
        message: `Document storage on IPFS failed. ${ipfsResult.error || 'Please try again.'}`
      });
    }

    const appData = {
      applicationId,
      farmerWallet: formattedWallet,
      schemeId,
      subsidyAmount,
      landAreaAcres: inputLandArea,
      isIncomeTaxPayee: inputITPayee,
      annualIncomeINR: inputIncome,
      pattadarPassbookNumber: inputPassbook,
      isEligible,
      eligibilityReason,
      documentHash,
      ipfsCid: ipfsResult.ipfsCid,
      ipfsGatewayUrl: ipfsResult.gatewayUrl,
      documentFileName: req.file.originalname,
      documentPath: req.file.path,
      status: 'PENDING',
      paymentStatus: isEligible ? 'PENDING_APPROVAL' : 'NOT_ELIGIBLE',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const appDoc = new Application(appData);
      await appDoc.save();

      const docMeta = new DocumentMetadata({
        documentId: `DOC-${Date.now()}`,
        applicationId,
        fileName: req.file.originalname,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        documentHash,
        ipfsCid: ipfsResult.ipfsCid,
        ipfsGatewayUrl: ipfsResult.gatewayUrl,
        uploadedBy: formattedWallet
      });
      await docMeta.save();
    } catch (err) {
      memoryApplications.set(applicationId, appData);
    }

    await AuditService.logEvent({
      applicationId,
      action: 'APPLICATION_SUBMITTED',
      actorWallet: formattedWallet,
      details: `Application submitted for AP scheme ${schemeId}. Eligibility: ${isEligible ? 'ELIGIBLE' : 'INELIGIBLE'} (${eligibilityReason})`
    });

    try {
      const onChainRes = await blockchainService.autoSubmitApplicationOnChain(applicationId, schemeId, documentHash, 'PENDING', formattedWallet);
      if (onChainRes && onChainRes.txHash) {
        appData.txHash = onChainRes.txHash;
      }
    } catch (bcErr) {
      console.warn('Auto on-chain submit note:', bcErr.message);
    }

    res.status(201).json({
      message: isEligible
        ? 'Subsidy application submitted successfully with IPFS storage'
        : 'Subsidy application recorded, but flagged INELIGIBLE under state policy guidelines',
      application: appData
    });
  } catch (error) {
    next(error);
  }
};

const ensureApplicationOnChain = async (req, res, next) => {
  try {
    const { id } = req.params;
    let appData = null;

    try {
      appData = await Application.findOne({ applicationId: id });
    } catch (err) {}

    if (!appData) {
      appData = memoryApplications.get(id);
    }

    if (!appData) {
      return res.status(404).json({ error: 'NotFound', message: `Application ${id} not found` });
    }

    const schemeId = appData.schemeId || 'AP-YSR-RYTHU-BHAROSA';
    const docHash = appData.documentHash || '0xc40cb667a0c048379b15a018697de6654ce5be64909d4b9114a8a2d5888f588c';
    const targetState = req.body.targetState || appData.status || 'PENDING';
    const farmerWallet = appData.farmerWallet;

    const result = await blockchainService.autoSubmitApplicationOnChain(id, schemeId, docHash, targetState, farmerWallet);


    res.status(200).json({
      message: 'On-chain pre-seeding executed successfully',
      result
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let application = null;

    try {
      application = await Application.findOne({ applicationId: id });
    } catch (err) {}

    if (!application) {
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

const getFarmerApplications = async (req, res, next) => {
  try {
    const formattedWallet = req.params.wallet.toLowerCase();
    let applications = [];

    try {
      applications = await Application.find({ farmerWallet: formattedWallet }).sort({ createdAt: -1 });
    } catch (err) {
      applications = Array.from(memoryApplications.values()).filter(a => a.farmerWallet === formattedWallet);
    }

    res.status(200).json({
      wallet: formattedWallet,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerFarmer,
  submitApplication,
  ensureApplicationOnChain,
  getApplicationById,
  getFarmerApplications,
  clearAllApplications,
  memoryApplications,
  memoryFarmers
};

