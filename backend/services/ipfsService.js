const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * IPFS Service — Pinata Decentralized Storage Integration
 */
class IPFSService {
  constructor() {
    this.apiKey = process.env.PINATA_API_KEY || '';
    this.secretApiKey = process.env.PINATA_SECRET_API_KEY || '';
    this.jwt = process.env.PINATA_JWT || '';
    this.gatewayUrl = process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/';
  }

  isConfigured() {
    return Boolean(this.jwt || (this.apiKey && this.secretApiKey));
  }

  /**
   * Uploads a file buffer or path to IPFS via Pinata API
   * @param {string} filePath - Absolute path to local file
   * @param {string} fileName - File name
   * @returns {Promise<{ success: boolean, ipfsCid: string, gatewayUrl: string, error?: string }>}
   */
  async uploadDocumentToIPFS(filePath, fileName) {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `File not found at path: ${filePath}` };
    }

    // Check if Pinata API credentials are available
    if (!this.isConfigured()) {
      // Deterministic academic prototype CID generation based on SHA-256 of file content
      const fileBuffer = fs.readFileSync(filePath);
      const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      const mockCid = `Qm${sha256.slice(0, 44)}`;
      const gatewayUrl = `${this.gatewayUrl}${mockCid}`;

      return {
        success: true,
        isSimulated: true,
        ipfsCid: mockCid,
        gatewayUrl,
        message: 'IPFS API credentials not set in backend/.env. Generated academic prototype IPFS CID.'
      };
    }

    try {
      const fileStream = fs.createReadStream(filePath);
      const formData = new FormData();
      const fileBlob = new Blob([fs.readFileSync(filePath)]);
      formData.append('file', fileBlob, fileName);

      const headers = {};
      if (this.jwt) {
        headers['Authorization'] = `Bearer ${this.jwt}`;
      } else {
        headers['pinata_api_key'] = this.apiKey;
        headers['pinata_secret_api_key'] = this.secretApiKey;
      }

      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.IpfsHash) {
        throw new Error(data.error || data.message || 'Pinata IPFS upload failed');
      }

      const ipfsCid = data.IpfsHash;
      const gatewayUrl = `${this.gatewayUrl}${ipfsCid}`;

      return {
        success: true,
        isSimulated: false,
        ipfsCid,
        gatewayUrl
      };
    } catch (err) {
      console.error('IPFS Upload Error:', err.message);
      return {
        success: false,
        error: `Document storage on IPFS failed: ${err.message}`
      };
    }
  }
}

module.exports = new IPFSService();
