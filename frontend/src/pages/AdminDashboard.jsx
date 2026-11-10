import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { api } from '../services/api';
import { PlusCircle, ShieldCheck, ToggleLeft, ToggleRight, Activity, Users, FileText, CheckCircle2, Layers } from 'lucide-react';

export const AdminDashboard = () => {
  const { walletAddress } = useWallet();
  const [stats, setStats] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [officerInput, setOfficerInput] = useState('');
  const [authorizedOfficers, setAuthorizedOfficers] = useState(['0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC']);
  const [msg, setMsg] = useState('');

  // New Scheme Form State
  const [schemeId, setSchemeId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subsidyAmount, setSubsidyAmount] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const statsRes = await api.getAdminStats();
      setStats(statsRes);
      const schemesRes = await api.getSchemes();
      setSchemes(schemesRes.schemes || []);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!schemeId || !name || !description || !subsidyAmount) {
      setMsg('All fields are required');
      return;
    }

    try {
      await api.createScheme({
        schemeId,
        name,
        description,
        subsidyAmount: Number(subsidyAmount)
      });
      setMsg(`Scheme ${schemeId} created successfully!`);
      setSchemeId('');
      setName('');
      setDescription('');
      setSubsidyAmount('');
      loadData();
    } catch (err) {
      setMsg(err.message || 'Failed to create scheme');
    }
  };

  const handleToggleStatus = async (sId, currentStatus) => {
    try {
      await api.updateSchemeStatus(sId, !currentStatus);
      loadData();
    } catch (err) {
      console.error('Failed to toggle scheme status:', err);
    }
  };

  const handleAddOfficer = (e) => {
    e.preventDefault();
    if (!officerInput.trim() || !officerInput.startsWith('0x')) return;
    if (!authorizedOfficers.includes(officerInput)) {
      setAuthorizedOfficers([...authorizedOfficers, officerInput]);
    }
    setOfficerInput('');
  };

  const handleRemoveOfficer = (addr) => {
    setAuthorizedOfficers(authorizedOfficers.filter(o => o !== addr));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1.25rem 0' }}>
      {/* Header Banner */}
      <div className="gov-card" style={{ background: 'linear-gradient(135deg, #0b2545 0%, #134074 100%)', color: '#ffffff' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.35rem' }}>Administrative Control Center</h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          Configure government subsidy schemes, manage officer wallet permissions, and monitor system-wide statistics.
        </p>
      </div>

      {msg && <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.85rem 1.25rem', borderRadius: '6px', fontWeight: '600', border: '1px solid #a7f3d0' }}>{msg}</div>}

      {/* Top Administrative Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="stat-card">
          <span className="stat-label">Total Applications</span>
          <div className="stat-value">{stats?.offchainStats?.totalApplications || 3}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #d97706' }}>
          <span className="stat-label" style={{ color: '#d97706' }}>Pending Verification</span>
          <div className="stat-value" style={{ color: '#d97706' }}>{stats?.offchainStats?.pendingApplications || 1}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #059669' }}>
          <span className="stat-label" style={{ color: '#059669' }}>Approved</span>
          <div className="stat-value" style={{ color: '#059669' }}>{stats?.offchainStats?.approvedApplications || 1}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #dc2626' }}>
          <span className="stat-label" style={{ color: '#dc2626' }}>Rejected</span>
          <div className="stat-value" style={{ color: '#dc2626' }}>{stats?.offchainStats?.rejectedApplications || 0}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <span className="stat-label" style={{ color: '#0284c7' }}>Active Schemes</span>
          <div className="stat-value" style={{ color: '#0284c7' }}>{schemes.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Scheme Management Console */}
        <div className="gov-card">
          <div className="gov-card-header">
            <h3 className="gov-card-title">
              <PlusCircle size={20} color="#0b2545" /> Launch New Subsidy Scheme
            </h3>
          </div>
          <form onSubmit={handleCreateScheme} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>Scheme Code / ID *</label>
              <input type="text" placeholder="e.g. SCHEME-PUMP-2026" value={schemeId} onChange={e => setSchemeId(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>Scheme Title *</label>
              <input type="text" placeholder="e.g. Solar Irrigation Water Pump Subsidy" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>Description & Guidelines *</label>
              <textarea rows="2" placeholder="Eligibility guidelines and aid scope" value={description} onChange={e => setDescription(e.target.value)} required></textarea>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>Financial Subsidy Amount (₹) *</label>
              <input type="number" placeholder="25000" value={subsidyAmount} onChange={e => setSubsidyAmount(e.target.value)} required />
            </div>
            <button type="submit" className="btn-gov-primary">Launch Scheme</button>
          </form>
        </div>

        {/* Officer Management Console */}
        <div className="gov-card">
          <div className="gov-card-header">
            <h3 className="gov-card-title">
              <ShieldCheck size={20} color="#059669" /> Authorized Officers Management
            </h3>
          </div>

          <form onSubmit={handleAddOfficer} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input type="text" placeholder="Officer Wallet Address (0x...)" value={officerInput} onChange={e => setOfficerInput(e.target.value)} required />
            <button type="submit" className="btn-gov-secondary" style={{ whiteSpace: 'nowrap' }}>Authorize</button>
          </form>

          <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Authorized Officer Addresses:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {authorizedOfficers.map(officerAddr => (
              <div key={officerAddr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{officerAddr}</span>
                <button onClick={() => handleRemoveOfficer(officerAddr)} style={{ background: 'none', color: '#dc2626', fontSize: '0.75rem', fontWeight: '700' }}>Revoke</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scheme Directory Table */}
      <div className="gov-card">
        <div className="gov-card-header">
          <h3 className="gov-card-title">Active Subsidy Schemes Registry</h3>
        </div>

        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Scheme ID</th>
                <th>Scheme Name</th>
                <th>Aid Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {schemes.map(s => (
                <tr key={s.schemeId}>
                  <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{s.schemeId}</td>
                  <td style={{ fontWeight: '600' }}>{s.name}</td>
                  <td style={{ fontWeight: '700', color: '#059669' }}>₹{s.subsidyAmount?.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${s.isActive ? 'badge-approved' : 'badge-rejected'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td>
                    <button onClick={() => handleToggleStatus(s.schemeId, s.isActive)} className="btn-gov-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.775rem' }}>
                      {s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
