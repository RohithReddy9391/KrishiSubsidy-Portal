const AuditLog = require('../models/AuditLog');

// Fallback in-memory audit log array for demonstration/offline mode
const memoryLogs = [];

/**
 * System Audit Trail Logging Service
 */
class AuditService {
  /**
   * Logs a subsidy application system event
   */
  static async logEvent({ applicationId, action, actorWallet, details = '', txHash = null }) {
    const entry = {
      applicationId,
      action,
      actorWallet: (actorWallet || 'system').toLowerCase(),
      details,
      txHash,
      timestamp: new Date()
    };

    try {
      const logDoc = new AuditLog(entry);
      await logDoc.save();
      console.log(`[AUDIT LOG] ${action} for App ${applicationId} by ${entry.actorWallet}`);
    } catch (err) {
      // In-memory fallback if database connection is pending
      memoryLogs.push(entry);
      console.log(`[AUDIT LOG (Memory)] ${action} for App ${applicationId} by ${entry.actorWallet}`);
    }

    return entry;
  }

  /**
   * Retrieves audit trail history for an application
   */
  static async getLogs(applicationId) {
    try {
      const dbLogs = await AuditLog.find({ applicationId }).sort({ timestamp: 1 });
      if (dbLogs && dbLogs.length > 0) {
        return dbLogs;
      }
    } catch (err) {
      // fallback
    }

    return memoryLogs.filter(l => l.applicationId === applicationId);
  }
}

module.exports = AuditService;
