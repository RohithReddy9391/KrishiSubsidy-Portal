const mongoose = require('mongoose');
const Application = require('../models/Application');
const blockchainService = require('./blockchainService');

/**
 * Dual-Tier Duplicate Subsidy Claim Check Service
 */
class DuplicateCheckService {
  /**
   * Checks if a farmer has already applied for a specific scheme
   * @param {string} farmerWallet 
   * @param {string} schemeId 
   * @returns {Promise<{ isDuplicate: boolean, reason: string|null, tier: string|null }>}
   */
  static async checkDuplicate(farmerWallet, schemeId) {
    const formattedWallet = farmerWallet.toLowerCase();

    // Tier 1: Database Check (if connected to MongoDB)
    if (mongoose.connection.readyState === 1) {
      try {
        const existingDbApp = await Application.findOne({
          farmerWallet: formattedWallet,
          schemeId: schemeId,
          status: { $in: ['PENDING', 'VERIFIED', 'APPROVED'] }
        });

        if (existingDbApp) {
          return {
            isDuplicate: true,
            reason: `Farmer wallet ${farmerWallet} already has an active or approved application (${existingDbApp.applicationId}) for scheme ${schemeId}.`,
            tier: 'Tier 1 (Database Level)'
          };
        }
      } catch (err) {
        console.warn('DuplicateCheckService DB check error:', err.message);
      }
    }

    // Tier 1 Fallback: In-Memory Store Check
    const { memoryApplications } = require('../controllers/farmerController');
    if (memoryApplications) {
      const memApp = Array.from(memoryApplications.values()).find(
        app => app.farmerWallet === formattedWallet && app.schemeId === schemeId && ['PENDING', 'VERIFIED', 'APPROVED'].includes(app.status)
      );
      if (memApp) {
        return {
          isDuplicate: true,
          reason: `Farmer wallet ${farmerWallet} already has an active or approved application (${memApp.applicationId}) for scheme ${schemeId}.`,
          tier: 'Tier 1 (In-Memory Fallback Level)'
        };
      }
    }

    // Tier 2: Smart Contract Check (On-chain single source of truth)
    try {
      const isAppliedOnChain = await blockchainService.hasFarmerApplied(formattedWallet, schemeId);
      if (isAppliedOnChain) {
        return {
          isDuplicate: true,
          reason: `On-chain record confirms wallet ${farmerWallet} has already claimed or applied for scheme ${schemeId}.`,
          tier: 'Tier 2 (Smart Contract Level)'
        };
      }
    } catch (err) {
      console.warn('DuplicateCheckService On-chain check skipped or error:', err.message);
    }

    return {
      isDuplicate: false,
      reason: null,
      tier: null
    };
  }
}

module.exports = DuplicateCheckService;
