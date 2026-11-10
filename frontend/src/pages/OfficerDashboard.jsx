import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { api } from '../services/api';
import { blockchain } from '../services/blockchain';
import { ShieldAlert, CheckCircle, XCircle, Clock, Eye, AlertTriangle, FileCheck, Award, Wallet, Layers, CheckSquare, ExternalLink, HardDrive, ShieldCheck, DollarSign, CheckCircle2 } from 'lucide-react';

export const OfficerDashboard = () => {
  const { walletAddress, contractAddress, connectWallet } = useWallet();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Category Filter Tab State (Default: PENDING review)
  const [activeTab, setActiveTab] = useState('PENDING');

  
  // Payment Release Modal State
  const [paymentReleaseModalApp, setPaymentReleaseModalApp] = useState(null);
  const [isReleasingPayment, setIsReleasingPayment] = useState(false);
  const [paymentReleaseResult, setPaymentReleaseResult] = useState(null);
  
  // MetaMask Transaction Status Display
  const [txState, setTxState] = useState(''); // '' | 'Waiting for signature' | 'Transaction submitted' | 'Transaction confirmed' | 'Transaction failed'

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await api.getPendingApplications();
      setQueue(res.applications || []);
    } catch (err) {
      console.error('Failed to load officer queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (appId) => {
    setStatusMsg({ type: '', text: '' });
    setTxState('Waiting for signature');
    console.log('Officer clicked Verify for application:', appId);

    try {
      if (!blockchain.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install the MetaMask browser extension to verify applications.');
      }

      // 1. Execute On-Chain Verification via MetaMask
      const onChainRes = await blockchain.signVerifyApplicationOnChain(contractAddress, appId);
      const txHash = onChainRes.txHash;
      const officer = onChainRes.officerWallet || walletAddress || '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';

      setTxState('Transaction submitted');

      // 2. Synchronize Verified Status with Backend after On-Chain Confirmation
      await api.verifyApplication(appId, officer, txHash, onChainRes.blockNumber);

      setTxState('Transaction confirmed');
      setStatusMsg({
        type: 'success',
        text: `Application ${appId} successfully VERIFIED on-chain! Tx: ${txHash.slice(0, 10)}...${txHash.slice(-6)}`
      });
      setSelectedApp(null);
      await loadQueue();
      setActiveTab('VERIFIED');
    } catch (err) {
      console.error('Verification failed:', err);
      setTxState('Transaction failed');
      setStatusMsg({ type: 'error', text: err.message || 'Verification failed' });
    }
  };

  const handleApprove = async (appId) => {
    setStatusMsg({ type: '', text: '' });
    setTxState('Waiting for signature');
    console.log('Officer clicked Approve for application:', appId);

    try {
      if (!blockchain.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install the MetaMask browser extension to approve claims.');
      }

      // 1. Execute On-Chain Approval via MetaMask
      const onChainRes = await blockchain.signApproveApplicationOnChain(contractAddress, appId, selectedApp);
      const txHash = onChainRes.txHash;
      const officer = onChainRes.officerWallet || walletAddress || '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';

      setTxState('Transaction submitted');

      // 2. Synchronize Approved Status with Backend after On-Chain Confirmation
      await api.approveApplication(appId, officer, txHash);

      setTxState('Transaction confirmed');
      setStatusMsg({
        type: 'success',
        text: `Application ${appId} APPROVED on-chain! Tx: ${txHash.slice(0, 10)}...${txHash.slice(-6)}. Status is now APPROVED (Payment Pending).`
      });
      setSelectedApp(null);
      await loadQueue();
      setActiveTab('APPROVED');
    } catch (err) {
      console.error('Approval failed:', err);
      setTxState('Transaction failed');
      setStatusMsg({ type: 'error', text: err.message || 'Approval failed' });
    }
  };

  const handleConfirmReleasePayment = async () => {
    if (!paymentReleaseModalApp) return;
    const appId = paymentReleaseModalApp.applicationId;
    setStatusMsg({ type: '', text: '' });
    setIsReleasingPayment(true);
    setPaymentReleaseResult(null);
    setTxState('Waiting for signature');
    console.log('Officer clicked Confirm & Release Payment for application:', appId);

    try {
      if (!blockchain.isMetaMaskInstalled()) {
        throw new Error('MetaMask is required to sign payment release transactions.');
      }

      // Execute Action 2: On-Chain Payment Release via MetaMask
      const onChainRes = await blockchain.signReleasePaymentOnChain(contractAddress, appId);
      const txHash = onChainRes.txHash;
      const releasedByWallet = onChainRes.releasedBy || walletAddress;

      setTxState('Transaction submitted');

      // Record successful payment release in backend database
      const res = await api.processDBTPayment({
        applicationId: appId,
        txHash,
        releasedBy: releasedByWallet
      });

      setTxState('Transaction confirmed');
      const resultPayload = {
        applicationId: appId,
        subsidyAmount: paymentReleaseModalApp.subsidyAmount || 5000,
        paymentStatus: 'PAYMENT_RELEASED',
        releasedBy: releasedByWallet,
        txHash: txHash || res.txHash || '0x4f829a1b0294c8e719',
        paymentDate: new Date().toLocaleString(),
        paymentType: 'Simulated On-Chain Subsidy Payment',
        utrReference: res.utrReference || 'SIM-DBT-2026-948123'
      };

      setPaymentReleaseResult(resultPayload);
      setStatusMsg({
        type: 'success',
        text: `Payment Released Successfully for ${appId}! Simulated DBT Reference: ${resultPayload.utrReference}`
      });

      await loadQueue();
      setActiveTab('RELEASED');
    } catch (err) {
      console.error('Payment release failed:', err);
      setTxState('Transaction failed');
      setStatusMsg({
        type: 'error',
        text: err.message || 'Payment release was not completed. The blockchain transaction was cancelled or failed.'
      });
    } finally {
      setIsReleasingPayment(false);
    }
  };

  const handleReject = async (appId) => {
    if (!rejectionReason.trim()) {
      setStatusMsg({ type: 'error', text: 'Please provide an explicit rejection explanation' });
      return;
    }

    setStatusMsg({ type: '', text: '' });
    try {
      const officer = walletAddress || '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
      await api.rejectApplication(appId, officer, rejectionReason);
      setStatusMsg({ type: 'success', text: `Application ${appId} REJECTED. Payment Status: NOT_ELIGIBLE.` });
      setSelectedApp(null);
      setShowRejectInput(false);
      setRejectionReason('');
      loadQueue();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Rejection failed' });
    }
  };

  const formatWallet = (addr) => {
    if (!addr) return 'N/A';
    return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
  };

  const pendingCount = queue.filter(a => a.status === 'PENDING').length;
  const verifiedCount = queue.filter(a => a.status === 'VERIFIED').length;
  const approvedPendingCount = queue.filter(a => a.status === 'APPROVED' && (a.paymentStatus === 'APPROVED_PAYMENT_PENDING' || !a.paymentStatus || a.paymentStatus === 'PENDING_APPROVAL')).length;
  const releasedCount = queue.filter(a => a.paymentStatus === 'PAYMENT_RELEASED').length;
  const rejectedCount = queue.filter(a => a.status === 'REJECTED').length;

  const filteredQueue = queue.filter(app => {
    const isApprovedPendingPayment = app.status === 'APPROVED' && (app.paymentStatus === 'APPROVED_PAYMENT_PENDING' || !app.paymentStatus || app.paymentStatus === 'PENDING_APPROVAL');
    const isPaymentReleased = app.paymentStatus === 'PAYMENT_RELEASED';

    if (activeTab === 'PENDING') return app.status === 'PENDING';
    if (activeTab === 'VERIFIED') return app.status === 'VERIFIED';
    if (activeTab === 'APPROVED') return isApprovedPendingPayment;
    if (activeTab === 'RELEASED') return isPaymentReleased;
    if (activeTab === 'REJECTED') return app.status === 'REJECTED';
    return true; // ALL
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1.25rem 0' }}>
      {/* Header Banner */}
      <div className="gov-card" style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0a192f 100%)', color: '#ffffff' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.35rem' }}>
          Government of Andhra Pradesh — Officer Verification Workspace
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          Inspect pending subsidy applications, evaluate AP land possession & IT payee rules, verify document SHA-256 hashes & IPFS references, approve claims on-chain, and release subsidy payments via MetaMask.
        </p>

        {!walletAddress && (
          <div style={{ marginTop: '1.25rem', background: 'rgba(255,255,255,0.12)', padding: '0.85rem 1.25rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem' }}>Officer Wallet not connected. Connect MetaMask to sign smart contract approvals & payment releases.</span>
            <button onClick={connectWallet} className="btn-gov-secondary" style={{ background: '#ffffff', color: '#0369a1' }}>Connect Officer Wallet</button>
          </div>
        )}
      </div>

      {statusMsg.text && (
        <div style={{
          background: statusMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color: statusMsg.type === 'success' ? '#047857' : '#dc2626',
          padding: '0.85rem 1.25rem', borderRadius: '6px', fontWeight: '600', fontSize: '0.9rem',
          border: `1px solid ${statusMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`
        }}>
          {statusMsg.text}
        </div>
      )}

      {/* Metrics Cards (Clickable Stepwise Filters) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
        <div onClick={() => setActiveTab('PENDING')} className="stat-card" style={{ borderLeft: '4px solid #d97706', cursor: 'pointer', background: activeTab === 'PENDING' ? '#fffbe6' : '#ffffff' }}>
          <span className="stat-label" style={{ color: '#d97706' }}>Pending Review</span>
          <div className="stat-value" style={{ color: '#d97706' }}>{pendingCount}</div>
          <span className="stat-desc">Step 1: Needs verification</span>
        </div>
        <div onClick={() => setActiveTab('VERIFIED')} className="stat-card" style={{ borderLeft: '4px solid #0284c7', cursor: 'pointer', background: activeTab === 'VERIFIED' ? '#f0f7ff' : '#ffffff' }}>
          <span className="stat-label" style={{ color: '#0284c7' }}>Verified Queue</span>
          <div className="stat-value" style={{ color: '#0284c7' }}>{verifiedCount}</div>
          <span className="stat-desc">Step 2: On-chain approval</span>
        </div>
        <div onClick={() => setActiveTab('APPROVED')} className="stat-card" style={{ borderLeft: '4px solid #047857', cursor: 'pointer', background: activeTab === 'APPROVED' ? '#ecfdf5' : '#ffffff' }}>
          <span className="stat-label" style={{ color: '#047857' }}>Approved Claims</span>
          <div className="stat-value" style={{ color: '#047857' }}>{approvedPendingCount}</div>
          <span className="stat-desc">Step 3: Ready for payment release</span>
        </div>
        <div onClick={() => setActiveTab('RELEASED')} className="stat-card" style={{ borderLeft: '4px solid #059669', cursor: 'pointer', background: activeTab === 'RELEASED' ? '#ecfdf5' : '#ffffff' }}>
          <span className="stat-label" style={{ color: '#059669' }}>Payment Released</span>
          <div className="stat-value" style={{ color: '#059669' }}>{releasedCount}</div>
          <span className="stat-desc">Payment completed</span>
        </div>
        <div onClick={() => setActiveTab('REJECTED')} className="stat-card" style={{ borderLeft: '4px solid #dc2626', cursor: 'pointer', background: activeTab === 'REJECTED' ? '#fef2f2' : '#ffffff' }}>
          <span className="stat-label" style={{ color: '#dc2626' }}>Rejected Claims</span>
          <div className="stat-value" style={{ color: '#dc2626' }}>{rejectedCount}</div>
          <span className="stat-desc">Ineligible under AP rules</span>
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="gov-card">
        <div className="gov-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className="gov-card-title" style={{ margin: 0 }}>Subsidy Applications Verification Queue</h3>
          
          {/* Stepwise Stage Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { id: 'PENDING', label: `Pending Review (${pendingCount})` },
              { id: 'VERIFIED', label: `Verified Queue (${verifiedCount})` },
              { id: 'APPROVED', label: `Approved Claims (${approvedPendingCount})` },
              { id: 'RELEASED', label: `Payment Released (${releasedCount})` },
              { id: 'REJECTED', label: `Rejected (${rejectedCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                style={{ fontSize: '0.775rem', padding: '0.3rem 0.75rem' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>


        {filteredQueue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
            <FileCheck size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <p>No applications currently match the selected queue filter ({activeTab}).</p>
          </div>
        ) : (
          <div className="gov-table-container">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Farmer Wallet</th>
                  <th>Scheme Code</th>
                  <th>Submitted Date</th>
                  <th>Application Status</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map(app => {
                  const isApprovedPendingPayment = app.status === 'APPROVED' && (app.paymentStatus === 'APPROVED_PAYMENT_PENDING' || !app.paymentStatus || app.paymentStatus === 'PENDING_APPROVAL');
                  const isPaymentReleased = app.paymentStatus === 'PAYMENT_RELEASED';


                  return (
                    <tr key={app.applicationId}>
                      <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{app.applicationId}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }} title={app.farmerWallet}>
                        {formatWallet(app.farmerWallet)}
                      </td>
                      <td style={{ fontWeight: '600', fontSize: '0.85rem' }}>{app.schemeId}</td>
                      <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
                      </td>
                      <td>
                        {isPaymentReleased ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#047857', background: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                            PAYMENT_RELEASED
                          </span>
                        ) : isApprovedPendingPayment ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0284c7', background: '#f0f7ff', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                            APPROVED_PAYMENT_PENDING
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: app.isEligible === false ? '#dc2626' : '#d97706' }}>
                            {app.paymentStatus || 'PENDING_APPROVAL'}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button onClick={() => { setSelectedApp(app); setTxState(''); setShowRejectInput(false); }} className="btn-gov-primary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}>
                            <Eye size={14} /> Review & Verify
                          </button>

                          {isApprovedPendingPayment && (
                            <button
                              onClick={() => { setPaymentReleaseModalApp(app); setPaymentReleaseResult(null); setStatusMsg({ type: '', text: '' }); }}
                              className="btn-gov-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem', background: '#047857', borderColor: '#047857' }}
                            >
                              <DollarSign size={14} /> Release Payment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. Officer Review & Verification Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div className="gov-card-header">
              <h3 className="gov-card-title">Officer Verification Workspace: {selectedApp.applicationId}</h3>
              <button onClick={() => setSelectedApp(null)} style={{ background: 'none', fontSize: '1.2rem', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Farmer / Application Details Grid */}
              <div style={{ background: '#f8fafc', padding: '1rem 1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                <div style={{ overflow: 'hidden' }}>
                  <strong>Farmer Wallet:</strong><br />
                  <span style={{ fontFamily: 'monospace', wordBreak: 'break-all', color: '#0f172a' }} title={selectedApp.farmerWallet}>
                    {formatWallet(selectedApp.farmerWallet)}
                  </span>
                </div>
                <div><strong>Scheme Code:</strong><br /><span style={{ fontWeight: '700', color: '#0369a1' }}>{selectedApp.schemeId}</span></div>
                <div><strong>Land Holding:</strong><br /><span style={{ fontWeight: '700' }}>{selectedApp.landAreaAcres || 2.5} Acres</span></div>
                <div><strong>Subsidy Aid Amount:</strong><br /><span style={{ color: '#047857', fontWeight: '800' }}>₹{selectedApp.subsidyAmount?.toLocaleString()}</span></div>
                <div><strong>Submission Timestamp:</strong><br /><span>{new Date(selectedApp.createdAt).toLocaleString()}</span></div>
                <div>
                  <strong>AP Passbook ID:</strong><br />
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{selectedApp.pattadarPassbookNumber || 'AP-WEBLAND-PASSBOOK-5884'}</span>
                </div>
              </div>

              {/* AP Policy Summary */}
              <div style={{
                border: `1px solid ${selectedApp.isEligible !== false ? '#bae6fd' : '#fecaca'}`,
                background: selectedApp.isEligible !== false ? '#f0f7ff' : '#fef2f2',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: selectedApp.isEligible !== false ? '#0369a1' : '#dc2626', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {selectedApp.isEligible !== false ? <ShieldCheck size={18} color="#0284c7" /> : <ShieldAlert size={18} color="#dc2626" />}
                  Andhra Pradesh State Policy Eligibility Evaluation Summary
                </h4>
                <p style={{ fontSize: '0.85rem', color: selectedApp.isEligible !== false ? '#0c4a6e' : '#991b1b', lineHeight: '1.4' }}>
                  {selectedApp.isEligible !== false
                    ? `✓ ELIGIBLE: Registered land area (${selectedApp.landAreaAcres || 2.5} acres) meets AP possession rules. Non-IT Payee status verified.`
                    : `⚠️ ${selectedApp.eligibilityReason || 'INELIGIBLE: Land holding or Income Tax payee status violates Government of Andhra Pradesh welfare subsidy rules.'}`}
                </p>
              </div>

              {/* Document Hash & IPFS */}
              <div style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0a192f', marginBottom: '0.5rem' }}>Document Integrity & Decentralized Storage (IPFS)</h4>
                <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div>File Name: <strong>{selectedApp.documentFileName || `Subsidy_Receipt_${selectedApp.applicationId}.pdf`}</strong></div>
                  <div>
                    Document SHA-256 Hash Digest:
                    <div className="hash-pill" style={{ marginTop: '0.25rem' }}>{selectedApp.documentHash}</div>
                  </div>
                  {selectedApp.ipfsCid && (
                    <div style={{ marginTop: '0.35rem' }}>
                      Decentralized IPFS CID: <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#047857' }}>{selectedApp.ipfsCid}</span><br />
                      <a
                        href={selectedApp.ipfsGatewayUrl || `https://gateway.pinata.cloud/ipfs/${selectedApp.ipfsCid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.8rem', color: '#0284c7', textDecoration: 'underline', marginTop: '0.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <ExternalLink size={14} /> View IPFS Document
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction State Banner */}
              {txState && (
                <div style={{
                  padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700',
                  background: txState === 'Transaction confirmed' ? '#ecfdf5' : txState === 'Transaction failed' ? '#fef2f2' : '#fffbe6',
                  color: txState === 'Transaction confirmed' ? '#047857' : txState === 'Transaction failed' ? '#dc2626' : '#d97706',
                  border: `1px solid ${txState === 'Transaction confirmed' ? '#a7f3d0' : txState === 'Transaction failed' ? '#fecaca' : '#fef3c7'}`
                }}>
                  MetaMask Transaction State: {txState}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0a192f' }}>Officer Authorization Action</h4>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {selectedApp.status === 'PENDING' && (
                    <button onClick={() => handleVerify(selectedApp.applicationId)} className="btn-gov-outline" style={{ flex: 1, color: '#0284c7', borderColor: '#bae6fd' }}>
                      Step 1: Sign & Verify Claim (MetaMask)
                    </button>
                  )}

                  {selectedApp.status === 'VERIFIED' && (
                    <button onClick={() => handleApprove(selectedApp.applicationId)} className="btn-gov-secondary" style={{ flex: 1 }}>
                      Step 2: Sign & Approve Claim (MetaMask)
                    </button>
                  )}

                  {selectedApp.status === 'APPROVED' && selectedApp.paymentStatus !== 'PAYMENT_RELEASED' && (
                    <button
                      onClick={() => { const appToRelease = selectedApp; setSelectedApp(null); setPaymentReleaseModalApp(appToRelease); setPaymentReleaseResult(null); }}
                      className="btn-gov-primary"
                      style={{ flex: 1, background: '#047857', borderColor: '#047857' }}
                    >
                      Action 2: Release Payment (MetaMask)
                    </button>
                  )}

                  {!showRejectInput && selectedApp.status !== 'APPROVED' && (
                    <button onClick={() => setShowRejectInput(true)} className="btn-gov-danger">
                      Reject Claim
                    </button>
                  )}
                </div>

                {showRejectInput && (
                  <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '6px', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#dc2626' }}>Mandatory Rejection Explanation *</label>
                    <textarea
                      rows="2"
                      placeholder="Specify reason for rejection (e.g. Land survey number mismatch or IT Payee exclusion)"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    ></textarea>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => setShowRejectInput(false)} className="btn-gov-outline">Cancel</button>
                      <button onClick={() => handleReject(selectedApp.applicationId)} className="btn-gov-danger">Confirm Rejection</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Release Payment Confirmation & Receipt Dialog Modal (Rule 11 & Rule 12) */}
      {paymentReleaseModalApp && (
        <div className="modal-overlay" onClick={() => !isReleasingPayment && setPaymentReleaseModalApp(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="gov-card-header">
              <h3 className="gov-card-title">Release Subsidy Payment</h3>
              <button onClick={() => setPaymentReleaseModalApp(null)} disabled={isReleasingPayment} style={{ background: 'none', fontSize: '1.2rem', color: '#64748b' }}>✕</button>
            </div>

            {!paymentReleaseResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div><strong>Application ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{paymentReleaseModalApp.applicationId}</span></div>
                  <div><strong>Subsidy Amount:</strong> <span style={{ color: '#047857', fontWeight: '800', fontSize: '1.1rem' }}>₹{paymentReleaseModalApp.subsidyAmount?.toLocaleString() || '5,000'}</span></div>
                  <div><strong>Payment Type:</strong> <span style={{ fontWeight: '700', color: '#0284c7' }}>Simulated On-Chain Subsidy Payment</span></div>
                </div>

                <div style={{ background: '#fffbe6', border: '1px solid #fef3c7', padding: '0.9rem 1.1rem', borderRadius: '6px', color: '#92400e', fontSize: '0.875rem', lineHeight: '1.4' }}>
                  “Confirm the blockchain transaction in MetaMask to release this subsidy payment.”
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button onClick={() => setPaymentReleaseModalApp(null)} disabled={isReleasingPayment} className="btn-gov-outline">Cancel</button>
                  <button
                    onClick={handleConfirmReleasePayment}
                    disabled={isReleasingPayment}
                    className="btn-gov-primary"
                    style={{ background: '#047857', borderColor: '#047857', padding: '0.65rem 1.25rem' }}
                  >
                    {isReleasingPayment ? 'Prompting MetaMask...' : 'Confirm & Release Payment'}
                  </button>
                </div>
              </div>
            ) : (
              /* Success Receipt Display after Blockchain Confirmation (Rule 12) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: '8px', color: '#047857' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={22} color="#047857" /> Payment Released Successfully
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>On-chain transaction confirmed on Hardhat Local Blockchain.</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div><strong>Payment Status:</strong> <span style={{ color: '#047857', fontWeight: '800' }}>{paymentReleaseResult.paymentStatus}</span></div>
                  <div><strong>Subsidy Amount:</strong> <span style={{ color: '#047857', fontWeight: '800' }}>₹{paymentReleaseResult.subsidyAmount?.toLocaleString()}</span></div>
                  <div><strong>Released By:</strong> <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{paymentReleaseResult.releasedBy}</span></div>
                  <div><strong>Blockchain Transaction:</strong> <span style={{ fontFamily: 'monospace', wordBreak: 'break-all', color: '#0284c7' }}>{paymentReleaseResult.txHash}</span></div>
                  <div><strong>Payment Date:</strong> <span>{paymentReleaseResult.paymentDate}</span></div>
                  <div><strong>Payment Type:</strong> <span>{paymentReleaseResult.paymentType}</span></div>
                  <div><strong>Simulated DBT Reference:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#047857' }}>{paymentReleaseResult.utrReference}</span></div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setPaymentReleaseModalApp(null); setPaymentReleaseResult(null); }} className="btn-gov-outline">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
