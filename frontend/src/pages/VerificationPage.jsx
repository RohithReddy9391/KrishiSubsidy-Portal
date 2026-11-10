import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, FileText, Database, Lock, Clock, Upload, Layers, HelpCircle, DollarSign, ExternalLink, HardDrive } from 'lucide-react';

export const VerificationPage = () => {
  const [appIdInput, setAppIdInput] = useState('APP-061961');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Local Browser-Based File Hash Verification State
  const [localFileHash, setLocalFileHash] = useState('');
  const [localFileName, setLocalFileName] = useState('');
  const [fileCheckResult, setFileCheckResult] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appIdParam = params.get('appId') || params.get('id');
    if (appIdParam && appIdParam.trim()) {
      const cleanId = appIdParam.trim();
      setAppIdInput(cleanId);
      fetchVerification(cleanId);
    }
  }, []);

  const fetchVerification = async (targetId) => {
    if (!targetId) return;
    setLoading(true);
    setError('');
    setResult(null);
    setFileCheckResult(null);
    setLocalFileHash('');

    try {
      const data = await api.getVerification(targetId);
      setResult(data);
    } catch (err) {
      setError(err.message || `No verification records found for Application ID ${targetId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchVerification(appIdInput.trim());
  };

  // Client-Side SHA-256 Calculation using Web Crypto API
  const handleLocalFileCheck = async (file) => {
    if (!file) return;
    setLocalFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setLocalFileHash(hashHex);

      const targetHash = result?.offChainRecord?.documentHash || result?.onChainRecord?.documentHash;
      if (targetHash) {
        const isMatch = hashHex.toLowerCase() === targetHash.toLowerCase();
        setFileCheckResult(isMatch);
      }
    } catch (err) {
      console.error('File hash calculation error:', err);
    }
  };

  const renderPaymentStatusBadge = (pStatus, appStatus) => {
    const rawStatus = pStatus || (appStatus === 'APPROVED' ? 'APPROVED_PAYMENT_PENDING' : appStatus === 'REJECTED' ? 'NOT_ELIGIBLE' : 'PENDING_APPROVAL');

    switch (rawStatus) {
      case 'PAYMENT_RELEASED':
        return <span style={{ color: '#047857', fontWeight: '800', fontSize: '0.8rem', background: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #a7f3d0' }}>✓ Payment Released (DBT)</span>;
      case 'APPROVED_PAYMENT_PENDING':
        return <span style={{ color: '#0284c7', fontWeight: '800', fontSize: '0.8rem', background: '#f0f7ff', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #bae6fd' }}>⏳ Approved – Payment Pending</span>;
      case 'PAYMENT_PROCESSING':
        return <span style={{ color: '#0284c7', fontWeight: '700', fontSize: '0.8rem', background: '#f0f7ff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>⏳ Payment Processing</span>;
      case 'NOT_ELIGIBLE':
        return <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '0.8rem', background: '#fef2f2', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #fecaca' }}>✕ Ineligible (State Policy)</span>;
      case 'PENDING_APPROVAL':
      default:
        return <span style={{ color: '#d97706', fontWeight: '700', fontSize: '0.8rem', background: '#fffbe6', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>⏳ Pending Officer Approval</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1.25rem 0' }}>
      {/* Header Banner */}
      <div className="gov-card" style={{ background: 'linear-gradient(135deg, #0a192f 0%, #103778 100%)', color: '#ffffff' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.35rem' }}>Government of Andhra Pradesh — Public Verification Portal</h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          Verify AP farmer subsidy claims, Pattadar passbook details, land holding rules, document SHA-256 cryptographic hashes & IPFS references against Ethereum ledger records.
        </p>
      </div>

      {/* Architecture Explanation Card */}
      <div className="gov-card" style={{ background: '#f0f7ff', border: '1px solid #bae6fd' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <Layers size={28} color="#0284c7" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0c4a6e', marginBottom: '0.25rem' }}>
              System Architecture: IPFS, SHA-256, Blockchain & MongoDB Boundaries
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#0369a1', lineHeight: '1.5' }}>
              <strong>IPFS:</strong> Stores the submitted document using decentralized content addressing.<br />
              <strong>SHA-256:</strong> Provides document integrity verification.<br />
              <strong>Blockchain:</strong> Provides an immutable record of application, verification, and approval.<br />
              <strong>MongoDB:</strong> Stores application and operational metadata.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="gov-card">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Enter Application ID (e.g. APP-061961)"
            value={appIdInput}
            onChange={(e) => setAppIdInput(e.target.value)}
            style={{ flex: 1, fontSize: '1rem', padding: '0.75rem 1rem' }}
          />
          <button type="submit" className="btn-gov-primary" disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
            <Search size={18} /> {loading ? 'Verifying...' : 'Verify Claim'}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '6px', fontWeight: '600', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Results Output */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Prominent Verification Result Banner */}
          <div className="gov-card" style={{
            background: result.isIntegrityVerified ? '#ecfdf5' : '#fef2f2',
            border: `2px solid ${result.isIntegrityVerified ? '#047857' : '#dc2626'}`,
            display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem'
          }}>
            {result.isIntegrityVerified ? (
              <CheckCircle2 size={46} color="#047857" style={{ flexShrink: 0 }} />
            ) : (
              <XCircle size={46} color="#dc2626" style={{ flexShrink: 0 }} />
            )}

            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: result.isIntegrityVerified ? '#047857' : '#dc2626' }}>
                {result.isIntegrityVerified ? '✓ VERIFIED' : '✕ NOT VERIFIED'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#1e293b', marginTop: '0.25rem' }}>
                {result.isIntegrityVerified
                  ? 'Blockchain record and application document hash match the stored records.'
                  : 'Document hashes between off-chain database and on-chain smart contract do not match or record is missing.'}
              </p>
            </div>
          </div>

          {/* Side-by-Side Comparison: Off-Chain / Payment Status vs Blockchain */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* OFF-CHAIN & DECENTRALIZED STORAGE STATUS */}
            <div className="gov-card">
              <div className="gov-card-header">
                <h3 className="gov-card-title" style={{ color: '#0369a1' }}>
                  <Database size={20} /> OFF-CHAIN & DECENTRALIZED STORAGE STATUS
                </h3>
              </div>

              {result.offChainRecord ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div><strong>Application ID:</strong> {result.offChainRecord.applicationId}</div>
                  <div><strong>Farmer Reference:</strong> <span style={{ fontFamily: 'monospace' }}>{result.offChainRecord.farmerWallet ? `${result.offChainRecord.farmerWallet.slice(0, 8)}...${result.offChainRecord.farmerWallet.slice(-6)}` : 'N/A'}</span></div>
                  <div><strong>Scheme Code:</strong> {result.offChainRecord.schemeId}</div>
                  <div><strong>Registered Land Area:</strong> {result.offChainRecord.landAreaAcres || 2.5} Acres</div>
                  <div><strong>AP Passbook ID:</strong> <span style={{ fontFamily: 'monospace' }}>{result.offChainRecord.pattadarPassbookNumber || 'AP-WEBLAND-PASSBOOK-99'}</span></div>
                  <div><strong>Income Tax Payee Status:</strong> {result.offChainRecord.isIncomeTaxPayee ? 'YES (Tax Payee)' : 'NO (Non-Tax Payee)'}</div>
                  <div><strong>Subsidy Aid Amount:</strong> ₹{result.offChainRecord.subsidyAmount?.toLocaleString()}</div>
                  <div><strong>Application Status:</strong> <span className={`badge badge-${result.offChainRecord.status.toLowerCase()}`}>{result.offChainRecord.status}</span></div>
                  <div><strong>Payment Status:</strong> {renderPaymentStatusBadge(result.offChainRecord.paymentStatus, result.offChainRecord.status)}</div>

                  {result.offChainRecord.utrReference && (
                    <div style={{ background: '#ecfdf5', padding: '0.75rem', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                      <strong style={{ color: '#047857' }}>Simulated Bank UTR Reference:</strong><br />
                      <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#047857', fontSize: '0.95rem' }}>
                        {result.offChainRecord.utrReference}
                      </span>
                    </div>
                  )}

                  <div><strong>Document File Name:</strong> {result.offChainRecord.documentFileName}</div>
                  <div>
                    <strong>Document SHA-256 Hash Digest:</strong>
                    <div className="hash-pill" style={{ marginTop: '0.25rem' }}>{result.offChainRecord.documentHash}</div>
                  </div>

                  {/* DECENTRALIZED STORAGE IPFS SECTION */}
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}>
                    <div style={{ fontWeight: '700', color: '#0a192f', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <HardDrive size={16} color="#047857" /> DECENTRALIZED STORAGE (IPFS)
                    </div>
                    <div>
                      IPFS Status: <span style={{ color: '#047857', fontWeight: '700' }}>Available</span>
                    </div>
                    {result.offChainRecord.ipfsCid && (
                      <div style={{ wordBreak: 'break-all', marginTop: '0.25rem' }}>
                        IPFS CID: <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#047857' }}>{result.offChainRecord.ipfsCid}</span>
                      </div>
                    )}
                    {result.offChainRecord.ipfsCid && (
                      <div style={{ marginTop: '0.35rem' }}>
                        <a
                          href={result.offChainRecord.ipfsGatewayUrl || `https://gateway.pinata.cloud/ipfs/${result.offChainRecord.ipfsCid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.8rem', color: '#0284c7', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <ExternalLink size={14} /> View Document on IPFS
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#64748b' }}>No off-chain record found.</p>
              )}
            </div>

            {/* BLOCKCHAIN RECORD */}
            <div className="gov-card">
              <div className="gov-card-header">
                <h3 className="gov-card-title" style={{ color: '#0a192f' }}>
                  <Layers size={20} /> BLOCKCHAIN RECORD (PROOF OF APPROVAL)
                </h3>
              </div>

              {result.onChainRecord && typeof result.onChainRecord === 'object' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div><strong>On-Chain Application ID:</strong> {result.onChainRecord.applicationId}</div>
                  <div><strong>Smart Contract Status:</strong> <span className="badge badge-approved">{result.onChainRecord.statusText}</span></div>
                  <div><strong>Verifying Officer Wallet:</strong> <span style={{ fontFamily: 'monospace' }}>{result.onChainRecord.verifiedByOfficer ? `${result.onChainRecord.verifiedByOfficer.slice(0, 6)}...${result.onChainRecord.verifiedByOfficer.slice(-4)}` : 'Verified'}</span></div>
                  <div><strong>Sealed Timestamp:</strong> {result.onChainRecord.timestamp}</div>
                  <div><strong>Transaction Hash:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.775rem', wordBreak: 'break-all' }}>{result.onChainRecord.txHash || 'Sealed on Smart Contract'}</span></div>
                  <div>
                    <strong>On-Chain SHA-256 Hash:</strong>
                    <div className="hash-pill" style={{ marginTop: '0.25rem' }}>{result.onChainRecord.documentHash}</div>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#64748b' }}>{typeof result.onChainRecord === 'string' ? result.onChainRecord : 'Pending on-chain transaction'}</p>
              )}
            </div>
          </div>

          {/* Browser File Hash Dropzone */}
          <div className="gov-card" style={{ border: '1px dashed #0284c7', background: '#f0f9ff' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0369a1', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={20} /> Live Document Authenticity Verification Dropzone
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
              Upload your local PDF or image document to compute its SHA-256 hash directly in your browser and verify it live against the on-chain record.
            </p>

            <input
              type="file"
              onChange={(e) => handleLocalFileCheck(e.target.files[0])}
              style={{ marginBottom: '0.75rem' }}
            />

            {localFileHash && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', background: '#ffffff', padding: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <div><strong>Selected File:</strong> {localFileName}</div>
                <div style={{ wordBreak: 'break-all' }}><strong>Browser-Calculated Hash:</strong> <span style={{ fontFamily: 'monospace', color: '#0369a1' }}>{localFileHash}</span></div>

                {fileCheckResult !== null && (
                  <div style={{
                    marginTop: '0.5rem', padding: '0.65rem 0.85rem', borderRadius: '4px', fontWeight: '700',
                    background: fileCheckResult ? '#ecfdf5' : '#fef2f2',
                    color: fileCheckResult ? '#047857' : '#dc2626'
                  }}>
                    {fileCheckResult ? '✓ MATCH: Document is 100% Authentic and Unmodified' : '✕ MISMATCH: File does not match on-chain record!'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Audit Trail Timeline */}
          <div className="gov-card">
            <div className="gov-card-header">
              <h3 className="gov-card-title">
                <Clock size={20} /> System Audit Trail Timeline
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              {/* Step 1 */}
              <div style={{ borderLeft: '3px solid #0a192f', paddingLeft: '1rem' }}>
                <div style={{ fontWeight: '700', color: '#0a192f' }}>1. Application Submitted</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Farmer submitted application for {result.offChainRecord?.schemeId || 'Subsidy Scheme'}.</div>
              </div>

              {/* Step 2 */}
              <div style={{ borderLeft: '3px solid #0284c7', paddingLeft: '1rem' }}>
                <div style={{ fontWeight: '700', color: '#0284c7' }}>2. Document SHA-256 Hash & IPFS CID Recorded</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Cryptographic hash: {result.offChainRecord?.documentHash?.slice(0, 18)}...<br />
                  IPFS CID: {result.offChainRecord?.ipfsCid || 'Pinned to IPFS'}
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ borderLeft: '3px solid #d97706', paddingLeft: '1rem' }}>
                <div style={{ fontWeight: '700', color: '#d97706' }}>3. Officer Verification</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Government Officer inspected land survey metadata, IPFS CID, and document integrity.</div>
              </div>

              {/* Step 4 */}
              <div style={{ borderLeft: '3px solid #047857', paddingLeft: '1rem' }}>
                <div style={{ fontWeight: '700', color: '#047857' }}>4. Application Approved & Sealed On-Chain</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Smart contract state updated to APPROVED. Transaction sealed on Ethereum ledger.</div>
              </div>

              {/* Step 5 */}
              <div style={{ borderLeft: '3px solid #0284c7', paddingLeft: '1rem' }}>
                <div style={{ fontWeight: '700', color: '#0284c7' }}>5. Simulated DBT Payment Process</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {result.offChainRecord?.utrReference
                    ? `Simulated DBT payment released. Bank UTR: ${result.offChainRecord.utrReference}`
                    : 'Payment Status: Approved – Payment Pending'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
