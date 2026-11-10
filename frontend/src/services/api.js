const API_BASE_URL = 'http://127.0.0.1:5000/api';

/**
 * Centralized API Communication Service for Backend Endpoints
 */

export const api = {
  // Health Check
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('API Health check failed');
    return res.json();
  },

  // Farmer Registration
  async registerFarmer(farmerData) {
    const res = await fetch(`${API_BASE_URL}/farmers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farmerData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Farmer registration failed');
    return data;
  },

  // Get Active Schemes
  async getSchemes() {
    const res = await fetch(`${API_BASE_URL}/schemes`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch schemes');
    return data;
  },

  // Submit Application with Document Upload
  async submitApplication(formData) {
    const res = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      body: formData // multipart/form-data
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Application submission failed');
    return data;
  },

  // On-Chain Application Pre-Seeding Helper
  async seedOnChain(id, targetState = 'PENDING') {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${id}/ensure-onchain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetState })
      });
      return await res.json();
    } catch (err) {
      console.warn('seedOnChain helper note:', err.message);
      return null;
    }
  },


  // Get Farmer Applications by Wallet
  async getFarmerApplications(walletAddress) {
    const res = await fetch(`${API_BASE_URL}/farmers/${walletAddress}/applications`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch farmer applications');
    return data;
  },

  // Get Single Application by ID
  async getApplicationById(id) {
    const res = await fetch(`${API_BASE_URL}/applications/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Application not found');
    return data;
  },

  // Officer Queue
  async getPendingApplications() {
    const res = await fetch(`${API_BASE_URL}/officer/applications/pending`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch officer queue');
    return data;
  },

  // Officer Verify (PENDING -> VERIFIED)
  async verifyApplication(id, officerWallet, txHash = null, blockNumber = null) {
    const res = await fetch(`${API_BASE_URL}/officer/applications/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officerWallet, txHash, blockNumber })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Officer verification failed');
    return data;
  },

  // Officer Approve (VERIFIED -> APPROVED)
  async approveApplication(id, officerWallet, txHash = null) {
    const res = await fetch(`${API_BASE_URL}/officer/applications/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officerWallet, txHash })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Officer approval failed');
    return data;
  },

  // Officer Reject (PENDING/VERIFIED -> REJECTED)
  async rejectApplication(id, officerWallet, rejectionReason) {
    const res = await fetch(`${API_BASE_URL}/officer/applications/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officerWallet, rejectionReason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Officer rejection failed');
    return data;
  },

  // Process Simulated DBT Payment
  async processDBTPayment(data) {
    const payload = typeof data === 'string' ? { applicationId: data } : data;
    const res = await fetch(`${API_BASE_URL}/payments/process-dbt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Simulated DBT payment processing failed');
    return resData;
  },

  // Admin Create Scheme
  async createScheme(schemeData) {
    const res = await fetch(`${API_BASE_URL}/admin/schemes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schemeData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Scheme creation failed');
    return data;
  },

  // Admin Update Scheme Status
  async updateSchemeStatus(id, isActive) {
    const res = await fetch(`${API_BASE_URL}/admin/schemes/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Scheme status update failed');
    return data;
  },

  // Admin Statistics
  async getAdminStats() {
    const res = await fetch(`${API_BASE_URL}/admin/statistics`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch admin stats');
    return data;
  },

  // Public Verification Endpoint
  async getVerification(applicationId) {
    const res = await fetch(`${API_BASE_URL}/verification/${applicationId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Verification search failed');
    return data;
  }
};
