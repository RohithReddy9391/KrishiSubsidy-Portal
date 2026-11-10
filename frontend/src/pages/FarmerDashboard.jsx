import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { api } from '../services/api';
import { generateApplicationReceipt } from '../services/pdfService';
import { FileText, Upload, Clock, CheckCircle, XCircle, AlertCircle, Eye, ShieldCheck, Wallet, ChevronDown, ChevronUp, Layers, ArrowRight, ExternalLink, HelpCircle, DollarSign, Download, QrCode, HardDrive, Check, Info, ShieldAlert, Filter, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const FarmerDashboard = () => {
  const { walletAddress } = useWallet();
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Category Filter State
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  // Farmer Details & Eligibility Inputs
  const [landAreaAcres, setLandAreaAcres] = useState(2.5);
  const [isIncomeTaxPayee, setIsIncomeTaxPayee] = useState(false);
  const [annualIncomeINR, setAnnualIncomeINR] = useState(120000);
  const [pattadarPassbookNumber, setPattadarPassbookNumber] = useState('AP-GUNTUR-PASSBOOK-5884');
  const [farmerCategory, setFarmerCategory] = useState('SMALL_MARGINAL');
  const [district, setDistrict] = useState('Guntur');

  // Form State
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [file, setFile] = useState(null);
  const [computedFileHash, setComputedFileHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals State
  const [applyModalScheme, setApplyModalScheme] = useState(null);
  const [eligibilityCheckScheme, setEligibilityCheckScheme] = useState(null);
  const [eligibilityModalResult, setEligibilityModalResult] = useState(null);
  const [selectedAppModal, setSelectedAppModal] = useState(null);

  useEffect(() => {
    loadSchemes();
    loadFarmerApplications();
  }, [walletAddress]);

  const loadSchemes = async () => {
    try {
      const res = await api.getSchemes();
      const schemeList = res.schemes || [];
      setSchemes(schemeList);
      if (schemeList.length > 0) {
        setSelectedSchemeId(schemeList[0].schemeId);
      }
    } catch (err) {
      console.error('Failed to load schemes:', err);
    }
  };

  const loadFarmerApplications = async () => {
    const targetWallet = walletAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    setLoading(true);
    try {
      const res = await api.getFarmerApplications(targetWallet);
      setApplications(res.applications || []);
    } catch (err) {
      console.warn('Failed to load farmer applications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter schemes by State Wise (AP) vs National Wise (Central)
  const filteredSchemes = schemes.filter(s => {
    if (activeCategoryFilter === 'State Wise (Andhra Pradesh)') {
      return s.category === 'STATE_AP' || s.category === 'Andhra Pradesh State' || s.state === 'Andhra Pradesh';
    }
    if (activeCategoryFilter === 'National Wise (Central)') {
      return s.category === 'CENTRAL_NATIONAL' || s.category === 'Central National' || s.state === 'National / Central';
    }
    return true;
  });

  const activeScheme = schemes.find(s => s.schemeId === selectedSchemeId) || schemes[0];

  // Pre-Application Eligibility Validation Logic (Indian / AP State Policy Rules)
  const computePreEligibility = (targetScheme = activeScheme, land = landAreaAcres, isITPayee = isIncomeTaxPayee, income = annualIncomeINR) => {
    if (!targetScheme) return { isEligible: true, reason: '' };

    const landNum = Number(land || 0);
    const maxLand = targetScheme.maxLandArea || 5.0;
    const isITAllowed = targetScheme.isIncomeTaxPayeeAllowed;
    const maxIncome = targetScheme.maxAnnualIncome || 250000;

    if (landNum > maxLand) {
      return {
        isEligible: false,
        reason: `INELIGIBLE: Registered land area (${landNum.toLocaleString()} acres) exceeds the maximum scheme threshold of ${maxLand} acres for small/marginal farmers.`
      };
    }

    if (!isITAllowed && isITPayee) {
      return {
        isEligible: false,
        reason: `INELIGIBLE: Income Tax Payees are strictly excluded from state welfare subsidy schemes under Government of Andhra Pradesh guidelines.`
      };
    }

    if (Number(income) > maxIncome) {
      return {
        isEligible: false,
        reason: `INELIGIBLE: Annual household income (₹${Number(income).toLocaleString()}) exceeds the state welfare cap of ₹${maxIncome.toLocaleString()}.`
      };
    }

    return {
      isEligible: true,
      reason: `✓ ELIGIBLE: Meets Andhra Pradesh land possession (${landNum} acres ≤ ${maxLand} acres), Income Tax payee exclusion, and annual income rules.`
    };
  };

  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setComputedFileHash(hashHex);
    } catch (err) {
      console.error('File hash preview error:', err);
    }
  };

  // Application Submission — Farmer does NOT need MetaMask!
  const handleApply = async (e) => {
    e.preventDefault();
    const targetScheme = applyModalScheme || activeScheme;
    if (!targetScheme) {
      setError('Please select a subsidy scheme');
      return;
    }
    if (!file) {
      setError('Please select a supporting document file to upload');
      return;
    }

    const evalResult = computePreEligibility(targetScheme, landAreaAcres, isIncomeTaxPayee, annualIncomeINR);
    if (!evalResult.isEligible) {
      setError(`Cannot submit application: ${evalResult.reason}`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const farmerWalletToUse = walletAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
      const formData = new FormData();
      formData.append('farmerWallet', farmerWalletToUse);
      formData.append('schemeId', targetScheme.schemeId);
      formData.append('landAreaAcres', landAreaAcres);
      formData.append('isIncomeTaxPayee', isIncomeTaxPayee);
      formData.append('annualIncomeINR', annualIncomeINR);
      formData.append('pattadarPassbookNumber', pattadarPassbookNumber);
      formData.append('document', file);

      const res = await api.submitApplication(formData);
      setSuccess(`Application submitted successfully! Application ID: ${res.application.applicationId}. Document pinned to IPFS.`);
      setFile(null);
      setComputedFileHash('');
      setApplyModalScheme(null);
      loadFarmerApplications();
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceipt = async (app) => {
    setError('');
    try {
      await generateApplicationReceipt(app);
    } catch (err) {
      setError('Failed to generate PDF receipt: ' + err.message);
    }
  };

  const totalApps = applications.length;
  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const verifiedCount = applications.filter(a => a.status === 'VERIFIED').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;

  const formatWallet = (addr) => {
    if (!addr) return 'N/A';
    return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-pending"><Clock size={12} /> Pending Review</span>;
      case 'VERIFIED':
        return <span className="badge badge-verified"><CheckCircle size={12} /> Verified</span>;
      case 'APPROVED':
        return <span className="badge badge-approved"><CheckCircle size={12} /> Approved</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const renderPaymentStatusBadge = (pStatus, appStatus) => {
    const rawStatus = pStatus || (appStatus === 'APPROVED' ? 'APPROVED_PAYMENT_PENDING' : appStatus === 'REJECTED' ? 'NOT_ELIGIBLE' : 'PENDING_APPROVAL');

    switch (rawStatus) {
      case 'PAYMENT_RELEASED':
        return <span style={{ color: '#047857', fontWeight: '800', fontSize: '0.8rem', background: '#ecfdf5', padding: '0.25rem 0.6rem', borderRadius: '4px', border: '1px solid #a7f3d0' }}>✓ PAYMENT_RELEASED</span>;
      case 'APPROVED_PAYMENT_PENDING':
        return <span style={{ color: '#0284c7', fontWeight: '800', fontSize: '0.8rem', background: '#f0f7ff', padding: '0.25rem 0.6rem', borderRadius: '4px', border: '1px solid #bae6fd' }}>⏳ APPROVED_PAYMENT_PENDING</span>;
      case 'NOT_ELIGIBLE':
        return <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '0.8rem', background: '#fef2f2', padding: '0.25rem 0.6rem', borderRadius: '4px', border: '1px solid #fecaca' }}>✕ NOT_ELIGIBLE</span>;
      case 'PENDING_APPROVAL':
      default:
        return <span style={{ color: '#d97706', fontWeight: '700', fontSize: '0.8rem', background: '#fffbe6', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>⏳ PENDING_APPROVAL</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1.5rem 0' }}>
      {/* Header Banner — Andhra Pradesh State Branding */}
      <div className="gov-card" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0a192f 100%)', color: '#ffffff', borderLeft: '6px solid #10b981' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.775rem', fontWeight: '800', background: '#047857', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Government of Andhra Pradesh — Department of Agriculture
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.5rem', marginBottom: '0.35rem' }}>
              AP State & National Farmer Subsidy Application Portal
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
              Select from Andhra Pradesh state-sponsored or central schemes, review guidelines, test eligibility, and submit online applications with IPFS & blockchain proof. No Web3 wallet required for farmers.
            </p>
          </div>
        </div>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.85rem 1.25rem', borderRadius: '6px', fontSize: '0.875rem', border: '1px solid #fecaca' }}>{error}</div>}
      {success && <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.85rem 1.25rem', borderRadius: '6px', fontSize: '0.875rem', border: '1px solid #a7f3d0' }}>{success}</div>}

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem' }}>
        <div className="stat-card">
          <span className="stat-label">Total Applications</span>
          <div className="stat-value">{totalApps}</div>
          <span className="stat-desc">Submitted in portal</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #d97706' }}>
          <span className="stat-label" style={{ color: '#d97706' }}>Pending Review</span>
          <div className="stat-value" style={{ color: '#d97706' }}>{pendingCount}</div>
          <span className="stat-desc">Awaiting officer review</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <span className="stat-label" style={{ color: '#0284c7' }}>Verified Queue</span>
          <div className="stat-value" style={{ color: '#0284c7' }}>{verifiedCount}</div>
          <span className="stat-desc">Awaiting on-chain approval</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #047857' }}>
          <span className="stat-label" style={{ color: '#047857' }}>Approved Claims</span>
          <div className="stat-value" style={{ color: '#047857' }}>{approvedCount}</div>
          <span className="stat-desc">Approved by officer</span>
        </div>
      </div>

      {/* Available State & National Schemes Catalog Grid */}
      <div className="gov-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <h3 className="gov-card-title" style={{ margin: 0 }}>
            🌾 State Wise & National Subsidy Schemes Catalog
          </h3>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['All', 'State Wise (Andhra Pradesh)', 'National Wise (Central)'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategoryFilter(cat)}
                className={`nav-btn ${activeCategoryFilter === cat ? 'active' : ''}`}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredSchemes.map(s => {
            const isStateAP = s.category === 'STATE_AP' || s.category === 'Andhra Pradesh State' || s.state === 'Andhra Pradesh';

            return (
              <div
                key={s.schemeId}
                style={{
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  padding: '1.2rem',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyWithBetween: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: '800', background: isStateAP ? '#047857' : '#0284c7', color: '#ffffff', padding: '0.15rem 0.55rem', borderRadius: '4px' }}>
                      {isStateAP ? 'ANDHRA PRADESH STATE' : 'CENTRAL NATIONAL'}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#047857', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                      Aid: ₹{s.subsidyAmount?.toLocaleString()}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0a192f', marginBottom: '0.4rem', lineHeight: '1.3' }}>
                    {s.name}
                  </h4>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
                    Code: {s.schemeId}
                  </div>

                  <p style={{ fontSize: '0.825rem', color: '#475569', marginBottom: '1rem', lineHeight: '1.4' }}>
                    {s.description}
                  </p>

                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', border: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                    <div>Max Land Holding: <strong>Up to {s.maxLandArea || 5.0} Acres</strong></div>
                    <div>Income Tax Payee Rule: <strong>{s.isIncomeTaxPayeeAllowed ? 'Allowed' : 'Excluded (Not Allowed)'}</strong></div>
                    <div>Max Household Income: <strong>₹{s.maxAnnualIncome?.toLocaleString() || '250,000'}/year</strong></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => { setEligibilityCheckScheme(s); setEligibilityModalResult(null); }}
                    className="btn-gov-outline"
                    style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', color: '#0284c7', borderColor: '#bae6fd' }}
                  >
                    Check Eligibility
                  </button>

                  <button
                    type="button"
                    onClick={() => { setApplyModalScheme(s); setError(''); setSuccess(''); setFile(null); }}
                    className="btn-gov-primary"
                    style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', background: '#047857', borderColor: '#047857' }}
                  >
                    Apply Now <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* "My Applications" Table */}
      <div className="gov-card">
        <div className="gov-card-header">
          <h3 className="gov-card-title">My Subsidy Applications & Tracking Timeline</h3>
        </div>

        {applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
            <FileText size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <p>No applications submitted yet.</p>
          </div>
        ) : (
          <div className="gov-table-container">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Scheme Code</th>
                  <th>Land Area</th>
                  <th>Financial Aid</th>
                  <th>Application Status</th>
                  <th>Payment Status</th>
                  <th>Decentralized Storage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => {
                  return (
                    <tr key={app.applicationId}>
                      <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{app.applicationId}</td>
                      <td style={{ fontWeight: '600', fontSize: '0.85rem' }}>{app.schemeId}</td>
                      <td style={{ fontWeight: '700' }}>{app.landAreaAcres || 2.5} Acres</td>
                      <td style={{ fontWeight: '800', color: '#047857' }}>₹{app.subsidyAmount?.toLocaleString()}</td>
                      <td>{renderStatusBadge(app.status)}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {renderPaymentStatusBadge(app.paymentStatus, app.status)}
                          {app.utrReference && (
                            <span style={{ fontFamily: 'monospace', fontSize: '0.725rem', color: '#047857', fontWeight: '700' }}>
                              Ref: {app.utrReference}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#047857', background: '#ecfdf5', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-block' }}>
                            IPFS Stored
                          </span>
                          {app.ipfsCid && (
                            <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#0369a1' }}>
                              CID: {app.ipfsCid.slice(0, 10)}...
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button onClick={() => setSelectedAppModal(app)} className="btn-gov-outline" style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}>
                            <Eye size={14} /> Details
                          </button>

                          <button onClick={() => handleDownloadReceipt(app)} className="btn-gov-outline" style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem', color: '#0369a1', borderColor: '#bae6fd' }}>
                            <Download size={14} /> Receipt
                          </button>
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

      {/* 1. Interactive Subsidy Application Modal Popup */}
      {applyModalScheme && (
        <div className="modal-overlay" onClick={() => setApplyModalScheme(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="gov-card-header">
              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: '800', background: '#047857', color: '#ffffff', padding: '0.15rem 0.55rem', borderRadius: '4px' }}>
                  ONLINE APPLICATION FORM
                </span>
                <h3 className="gov-card-title" style={{ marginTop: '0.35rem' }}>Apply for {applyModalScheme.name}</h3>
              </div>
              <button onClick={() => setApplyModalScheme(null)} style={{ background: 'none', fontSize: '1.25rem', color: '#64748b' }}>✕</button>
            </div>

            {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.85rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fecaca' }}>{error}</div>}

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>Land Holding (Acres) *</label>
                  <input type="number" step="0.1" value={landAreaAcres} onChange={(e) => setLandAreaAcres(e.target.value)} required />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Scheme Cap: Max {applyModalScheme.maxLandArea || 5.0} Acres</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>Income Tax Payee? *</label>
                  <select value={isIncomeTaxPayee ? 'true' : 'false'} onChange={(e) => setIsIncomeTaxPayee(e.target.value === 'true')} required>
                    <option value="false">NO (Non-Tax Payee)</option>
                    <option value="true">YES (Income Tax Payee)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>Annual Income (INR) *</label>
                  <input type="number" value={annualIncomeINR} onChange={(e) => setAnnualIncomeINR(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>AP Pattadar Passbook # *</label>
                  <input type="text" value={pattadarPassbookNumber} onChange={(e) => setPattadarPassbookNumber(e.target.value)} required />
                </div>
              </div>

              {/* Live Eligibility Policy Assessment inside Popup */}
              {(() => {
                const evalRes = computePreEligibility(applyModalScheme, landAreaAcres, isIncomeTaxPayee, annualIncomeINR);
                return (
                  <div style={{
                    background: evalRes.isEligible ? '#ecfdf5' : '#fef2f2',
                    border: `1.5px solid ${evalRes.isEligible ? '#a7f3d0' : '#fecaca'}`,
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    {evalRes.isEligible ? <CheckCircle2 size={24} color="#047857" style={{ flexShrink: 0 }} /> : <ShieldAlert size={24} color="#dc2626" style={{ flexShrink: 0 }} />}
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.875rem', color: evalRes.isEligible ? '#047857' : '#dc2626' }}>
                        {evalRes.isEligible ? 'AP Policy Pre-Verification: ELIGIBLE' : 'AP Policy Pre-Verification: EXCLUDED'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: evalRes.isEligible ? '#065f46' : '#991b1b', marginTop: '0.15rem' }}>
                        {evalRes.reason}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Upload Land Document */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>Upload Land Title / Pattadar Passbook Proof (PDF/JPG/PNG) *</label>
                <div className="upload-dropzone" onClick={() => document.getElementById('farmerModalFileInput').click()}>
                  <input
                    id="farmerModalFileInput"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.txt"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  <Upload size={30} color="#0284c7" style={{ margin: '0 auto 0.4rem' }} />
                  {file ? (
                    <div style={{ fontWeight: '700', color: '#0a192f', fontSize: '0.9rem' }}>{file.name}</div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Click or drop land survey document here (Pinned to IPFS & SHA-256 hashed)</div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setApplyModalScheme(null)} className="btn-gov-outline">Cancel</button>
                <button
                  type="submit"
                  className="btn-gov-primary"
                  disabled={isSubmitting || !computePreEligibility(applyModalScheme, landAreaAcres, isIncomeTaxPayee, annualIncomeINR).isEligible}
                  style={{
                    padding: '0.7rem 1.5rem',
                    background: !computePreEligibility(applyModalScheme, landAreaAcres, isIncomeTaxPayee, annualIncomeINR).isEligible ? '#94a3b8' : '#047857',
                    borderColor: !computePreEligibility(applyModalScheme, landAreaAcres, isIncomeTaxPayee, annualIncomeINR).isEligible ? '#94a3b8' : '#047857',
                    cursor: !computePreEligibility(applyModalScheme, landAreaAcres, isIncomeTaxPayee, annualIncomeINR).isEligible ? 'not-allowed' : 'pointer'
                  }}
                >
                  {!computePreEligibility(applyModalScheme, landAreaAcres, isIncomeTaxPayee, annualIncomeINR).isEligible
                    ? '❌ Ineligible (Application Blocked)'
                    : isSubmitting ? 'Uploading to IPFS & Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Check Eligibility Calculator Modal */}
      {eligibilityCheckScheme && (
        <div className="modal-overlay" onClick={() => setEligibilityCheckScheme(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="gov-card-header">
              <h3 className="gov-card-title">Eligibility Calculator ({eligibilityCheckScheme.schemeId})</h3>
              <button onClick={() => setEligibilityCheckScheme(null)} style={{ background: 'none', fontSize: '1.25rem', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setEligibilityModalResult(computePreEligibility(eligibilityCheckScheme, landAreaAcres, isIncomeTaxPayee, annualIncomeINR)); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>Land Holding (Acres) *</label>
                <input type="number" step="0.1" value={landAreaAcres} onChange={(e) => setLandAreaAcres(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>Income Tax Payee? *</label>
                <select value={isIncomeTaxPayee ? 'true' : 'false'} onChange={(e) => setIsIncomeTaxPayee(e.target.value === 'true')} required>
                  <option value="false">NO (Non-Tax Payee)</option>
                  <option value="true">YES (Income Tax Payee)</option>
                </select>
              </div>

              <button type="submit" className="btn-gov-secondary">Evaluate Eligibility</button>
            </form>

            {eligibilityModalResult && (
              <div style={{
                marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '6px', fontSize: '0.85rem',
                background: eligibilityModalResult.isEligible ? '#ecfdf5' : '#fef2f2',
                color: eligibilityModalResult.isEligible ? '#047857' : '#dc2626',
                border: `1px solid ${eligibilityModalResult.isEligible ? '#a7f3d0' : '#fecaca'}`
              }}>
                <div style={{ fontWeight: '800', marginBottom: '0.2rem' }}>
                  {eligibilityModalResult.isEligible ? '✓ ELIGIBLE FOR SUBSIDY' : '✕ INELIGIBLE'}
                </div>
                <div>{eligibilityModalResult.reason}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Application Details & Payment Record Modal (Rule 13) */}
      {selectedAppModal && (
        <div className="modal-overlay" onClick={() => setSelectedAppModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '760px' }}>
            <div className="gov-card-header">
              <h3 className="gov-card-title">Application & Payment Details ({selectedAppModal.applicationId})</h3>
              <button onClick={() => setSelectedAppModal(null)} style={{ background: 'none', fontSize: '1.25rem', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
                <div><strong>Application ID:</strong><br /><span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{selectedAppModal.applicationId}</span></div>
                <div><strong>Target Scheme:</strong><br /><span style={{ fontWeight: '700' }}>{selectedAppModal.schemeId}</span></div>
                <div><strong>Land Holding:</strong><br /><span>{selectedAppModal.landAreaAcres || 2.5} Acres</span></div>
                <div><strong>Subsidy Aid Amount:</strong><br /><span style={{ color: '#047857', fontWeight: '800', fontSize: '1.05rem' }}>₹{selectedAppModal.subsidyAmount?.toLocaleString()}</span></div>
                <div><strong>Application Status:</strong><br /><span>{renderStatusBadge(selectedAppModal.status)}</span></div>
                <div><strong>Payment Status:</strong><br />{renderPaymentStatusBadge(selectedAppModal.paymentStatus, selectedAppModal.status)}</div>
                <div><strong>Payment Type:</strong><br /><span style={{ color: '#0284c7', fontWeight: '700' }}>Simulated On-Chain Subsidy Payment</span></div>
                <div><strong>Transaction Hash:</strong><br /><span style={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>{selectedAppModal.paymentTxHash || selectedAppModal.txHash || 'Sealed on Hardhat Local Blockchain'}</span></div>
                <div><strong>Payment Date:</strong><br /><span>{selectedAppModal.paymentProcessedAt ? new Date(selectedAppModal.paymentProcessedAt).toLocaleString() : 'Pending Payment Release'}</span></div>
                <div><strong>Simulated DBT Reference:</strong><br /><span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#047857' }}>{selectedAppModal.utrReference || 'Pending Release'}</span></div>
              </div>

              {/* Direct Verification Shareable Link */}
              <div style={{ background: '#f0f7ff', border: '1px solid #bae6fd', padding: '0.85rem 1.1rem', borderRadius: '6px', fontSize: '0.825rem' }}>
                <strong>Shareable Public Verification Link:</strong><br />
                <a
                  href={`/verify?appId=${selectedAppModal.applicationId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0284c7', textDecoration: 'underline', fontFamily: 'monospace' }}
                >
                  http://localhost:5173/verify?appId={selectedAppModal.applicationId}
                </a>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => handleDownloadReceipt(selectedAppModal)} className="btn-gov-outline" style={{ color: '#0369a1', borderColor: '#bae6fd' }}>
                  <Download size={14} /> Download Receipt PDF
                </button>
                <button onClick={() => setSelectedAppModal(null)} className="btn-gov-outline">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
