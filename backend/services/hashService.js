const crypto = require('crypto');
const fs = require('fs');

/**
 * Deterministic SHA-256 Document Hashing Service
 */
class HashService {
  /**
   * Computes SHA-256 hash string from a Buffer
   * @param {Buffer} buffer 
   * @returns {string} Hex string prefixed with 0x
   */
  static computeBufferHash(buffer) {
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return `0x${hash}`;
  }

  /**
   * Computes SHA-256 hash string from a File Path
   * @param {string} filePath 
   * @returns {string} Hex string prefixed with 0x
   */
  static computeFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    return this.computeBufferHash(fileBuffer);
  }

  /**
   * Verifies if a presented file matches an expected on-chain or DB hash
   * @param {Buffer|string} fileSource Buffer or file path
   * @param {string} expectedHash Target SHA-256 hash
   * @returns {boolean}
   */
  static verifyHash(fileSource, expectedHash) {
    const computed = typeof fileSource === 'string'
      ? this.computeFileHash(fileSource)
      : this.computeBufferHash(fileSource);

    return computed.toLowerCase() === expectedHash.toLowerCase();
  }
}

module.exports = HashService;
