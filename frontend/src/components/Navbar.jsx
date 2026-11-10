import React from 'react';
import { useWallet } from '../context/WalletContext';
import { ShieldCheck, Wallet, FileSearch, Building2, Landmark, PhoneCall, Globe, Award } from 'lucide-react';

export const Navbar = () => {
  const { walletAddress, activeRole, setActiveRole, activeTab, setActiveTab, connectWallet, isConnecting } = useWallet();

  const handleRoleChange = (tabName, roleName = null) => {
    if (roleName) setActiveRole(roleName);
    setActiveTab(tabName);
  };

  const formatWallet = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="gov-header">
      {/* Top Government Official Bar */}
      <div className="gov-top-bar">
        <div className="container top-bar-content">
          <div className="top-bar-left">
            <span>🇮🇳 Ministry of Agriculture & Farmers Welfare</span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <PhoneCall size={12} /> Kisan Helpline: <strong>1800-115-526</strong>
            </span>
          </div>

          <div className="top-bar-right">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
              <Globe size={12} /> English / हिंदी
            </span>
            <span>|</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', color: '#ffffff' }}>
              Academic Research Prototype
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container">
        <div className="nav-wrapper">
          {/* Brand Logo */}
          <div className="brand-title" onClick={() => setActiveTab('landing')}>
            <div className="brand-emblem">
              <Landmark size={24} />
            </div>
            <div>
              <h1 className="brand-name">KrishiSubsidy Portal</h1>
              <p className="brand-subtitle">National Farmer Subsidy Verification Network</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="nav-links">
            <button
              onClick={() => setActiveTab('landing')}
              className={`nav-btn ${activeTab === 'landing' ? 'active' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('schemes')}
              className={`nav-btn ${activeTab === 'schemes' ? 'active' : ''}`}
            >
              Schemes
            </button>
            <button
              onClick={() => handleRoleChange('farmer', 'farmer')}
              className={`nav-btn ${activeTab === 'farmer' ? 'active' : ''}`}
            >
              Farmer Portal
            </button>
            <button
              onClick={() => handleRoleChange('officer', 'officer')}
              className={`nav-btn ${activeTab === 'officer' ? 'active' : ''}`}
            >
              Officer Portal
            </button>
            <button
              onClick={() => handleRoleChange('admin', 'admin')}
              className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
            >
              Admin Portal
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`nav-btn nav-btn-highlight ${activeTab === 'verify' ? 'active' : ''}`}
            >
              <FileSearch size={15} /> Verify Claim
            </button>
          </nav>

          {/* Right Action: Connected Web3 Wallet Badge */}
          <div>
            {walletAddress ? (
              <div className="wallet-status-card" title={walletAddress}>
                <div className="status-indicator-dot"></div>
                <span>Connected | Wallet: {formatWallet(walletAddress)}</span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-gov-primary"
                disabled={isConnecting}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                <Wallet size={16} />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Announcements Notice Ticker Bar */}
      <div className="ticker-container">
        <div className="container ticker-content">
          <span className="ticker-badge">Notice</span>
          <marquee scrollamount="5" style={{ color: '#334155', fontWeight: '500' }}>
            📢 Online applications are active for PM-KISAN 2026 Season • ⚡ PM-KUSUM 60% Solar Water Pump Subsidy extended for all districts • 🛡️ Pradhan Mantri Fasal Bima Yojana crop insurance claim verification live on-chain.
          </marquee>
        </div>
      </div>
    </header>
  );
};
