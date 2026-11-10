import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { ShieldCheck, FileCheck2, UserCheck, Lock, Search, ArrowRight, CheckCircle2, Award, Landmark, Eye, Database, Layers, User, ShieldAlert, ArrowUpRight } from 'lucide-react';

export const LandingPage = () => {
  const { setActiveTab, connectWallet, walletAddress } = useWallet();
  const [searchId, setSearchId] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      setActiveTab('verify');
    }
  };

  const schemesPreview = [
    { id: 'PM-KISAN', title: 'PM-KISAN Nidhi', category: 'Direct Financial Transfer', benefit: '₹6,000 / year', desc: 'Direct income support in 3 equal installments to landholding families.' },
    { id: 'PMFBY', title: 'PMFBY Crop Insurance', category: 'Crop Risk Protection', benefit: 'Up to ₹15,000 / ha', desc: 'Comprehensive crop insurance against natural calamities and drought.' },
    { id: 'PM-KUSUM', title: 'PM-KUSUM Solar Pump', category: 'Renewable Infrastructure', benefit: '60% Solar Subsidy', desc: 'Financial assistance for solar agriculture pump setup and grid integration.' },
    { id: 'PMKSY', title: 'PMKSY Micro Irrigation', category: 'Water Resource Aid', benefit: '50% Drip Subsidy', desc: 'Per Drop More Crop - Subsidy for micro-irrigation systems.' },
    { id: 'AIF-2026', title: 'Agri Infrastructure Fund', category: 'Post-Harvest Storage', benefit: 'Credit Linked Aid', desc: 'Debt financing facility for post-harvest management infrastructure.' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '1.5rem 0' }}>
      {/* Real Government Hero Banner */}
      <section className="gov-card" style={{ background: 'linear-gradient(135deg, #0a192f 0%, #103778 100%)', color: '#ffffff', padding: '3.5rem 2.25rem', borderRadius: '1rem', border: 'none' }}>
        <div style={{ maxWidth: '900px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', padding: '0.4rem 0.95rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', marginBottom: '1.25rem' }}>
            <Award size={16} color="#38bdf8" /> Official Academic Research Prototype Portal
          </div>

          <h1 style={{ fontSize: '2.6rem', fontWeight: '800', lineHeight: '1.25', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            National Blockchain-Based Farmer Subsidy Distribution Portal
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '2.25rem' }}>
            Enhancing transparency, eliminating duplicate subsidy claims, and guaranteeing cryptographic document integrity through Ethereum smart contracts and SHA-256 hashing.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <button
              onClick={() => setActiveTab('schemes')}
              className="btn-gov-secondary"
              style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}
            >
              Explore Schemes <ArrowRight size={18} />
            </button>

            <button
              onClick={() => setActiveTab('verify')}
              className="btn-gov-outline"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.25)', padding: '0.85rem 1.85rem', fontSize: '1rem' }}
            >
              <Search size={18} /> Verify Claim Record
            </button>
          </div>

          {/* Quick Metrics Counter Ribbon */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#38bdf8' }}>100%</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Cryptographic Hash Audit Trail</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#4ade80' }}>₹50,000</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Max Aid Per Claim</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#facc15' }}>5 Active</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Central Government Schemes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Quick Entry Portal Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="gov-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('farmer')}>
          <div style={{ background: '#f0f7ff', color: '#103778', padding: '0.75rem', borderRadius: '8px', display: 'inline-flex', marginBottom: '1rem' }}>
            <User size={26} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0a192f', marginBottom: '0.35rem' }}>Farmer Portal</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Submit new subsidy claims, upload land proofs, and track application progress.</p>
          <span style={{ fontSize: '0.825rem', fontWeight: '700', color: '#103778', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            Access Portal <ArrowUpRight size={14} />
          </span>
        </div>

        <div className="gov-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('officer')}>
          <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.75rem', borderRadius: '8px', display: 'inline-flex', marginBottom: '1rem' }}>
            <ShieldCheck size={26} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0a192f', marginBottom: '0.35rem' }}>Officer Workspace</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Inspect pending claims, verify document hashes, and sign approvals via MetaMask.</p>
          <span style={{ fontSize: '0.825rem', fontWeight: '700', color: '#047857', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            Officer Login <ArrowUpRight size={14} />
          </span>
        </div>

        <div className="gov-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('admin')}>
          <div style={{ background: '#fffbe6', color: '#d97706', padding: '0.75rem', borderRadius: '8px', display: 'inline-flex', marginBottom: '1rem' }}>
            <Landmark size={26} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0a192f', marginBottom: '0.35rem' }}>Admin Console</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Launch new subsidy schemes, manage officer wallet permissions, and monitor metrics.</p>
          <span style={{ fontSize: '0.825rem', fontWeight: '700', color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            Admin Console <ArrowUpRight size={14} />
          </span>
        </div>

        <div className="gov-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('verify')}>
          <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.75rem', borderRadius: '8px', display: 'inline-flex', marginBottom: '1rem' }}>
            <FileCheck2 size={26} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0a192f', marginBottom: '0.35rem' }}>Public Verifier</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Verify any Application ID against on-chain smart contract records publicly.</p>
          <span style={{ fontSize: '0.825rem', fontWeight: '700', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            Verify Record <ArrowUpRight size={14} />
          </span>
        </div>
      </section>

      {/* Quick Verification Search Box */}
      <section className="gov-card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0a192f', marginBottom: '0.35rem' }}>Public Subsidy Application Verification</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>Enter any Application ID to view off-chain metadata, smart contract state, and SHA-256 document hash verification.</p>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Enter Application ID (e.g. APP-091010)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-gov-primary" style={{ whiteSpace: 'nowrap' }}>
            <Search size={16} /> Verify Application
          </button>
        </form>
      </section>

      {/* Key System Capabilities */}
      <section>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', textAlign: 'center', color: '#0a192f', marginBottom: '2rem' }}>Key System Capabilities</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div className="gov-card">
            <div style={{ background: '#f0f7ff', color: '#103778', padding: '0.75rem', borderRadius: '8px', display: 'inline-flex', marginBottom: '1rem' }}>
              <Eye size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0a192f', marginBottom: '0.35rem' }}>Transparent Records</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
              Application submissions, officer verification statuses, and approval timestamps are published transparently for auditing.
            </p>
          </div>

          <div className="gov-card">
            <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.75rem', borderRadius: '8px', display: 'inline-flex', marginBottom: '1rem' }}>
              <FileCheck2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0a192f', marginBottom: '0.35rem' }}>Document Integrity</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
              Uploaded land title deeds and identity proofs generate cryptographic SHA-256 hashes to guarantee documents cannot be altered.
            </p>
          </div>

          <div className="gov-card">
            <div style={{ background: '#fffbe6', color: '#d97706', padding: '0.75rem', borderRadius: '8px', display: 'inline-flex', marginBottom: '1rem' }}>
              <UserCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0a192f', marginBottom: '0.35rem' }}>Application Tracking</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
              Farmers track real-time application milestones from initial submission to final subsidy disbursement approval.
            </p>
          </div>

          <div className="gov-card">
            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.75rem', borderRadius: '8px', display: 'inline-flex', marginBottom: '1rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0a192f', marginBottom: '0.35rem' }}>Auditable Decisions</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
              Government officer approvals and rejections are signed via Web3 wallets and logged with immutable timestamps.
            </p>
          </div>
        </div>
      </section>

      {/* 6-Step Workflow Visualization */}
      <section className="gov-card" style={{ padding: '2.5rem 1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', textAlign: 'center', color: '#0a192f', marginBottom: '2.25rem' }}>Subsidy Application & Verification Workflow</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', textAlign: 'center' }}>
          <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ background: '#0a192f', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem', fontWeight: '800', fontSize: '0.85rem' }}>1</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0a192f' }}>Farmer</h4>
            <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.25rem' }}>Connects Web3 wallet & selects scheme</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ background: '#0a192f', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem', fontWeight: '800', fontSize: '0.85rem' }}>2</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0a192f' }}>Apply</h4>
            <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.25rem' }}>Uploads land proof & calculates SHA-256 hash</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ background: '#0a192f', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem', fontWeight: '800', fontSize: '0.85rem' }}>3</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0a192f' }}>Verification</h4>
            <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.25rem' }}>Officer verifies eligibility & document hash</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ background: '#0a192f', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem', fontWeight: '800', fontSize: '0.85rem' }}>4</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0a192f' }}>Blockchain Record</h4>
            <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.25rem' }}>Seals status & hash digest on-chain</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ background: '#0a192f', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem', fontWeight: '800', fontSize: '0.85rem' }}>5</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0a192f' }}>Approval</h4>
            <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.25rem' }}>Officer signs authorization transaction</p>
          </div>

          <div style={{ background: '#ecfdf5', padding: '1.1rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
            <div style={{ background: '#047857', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem', fontWeight: '800', fontSize: '0.85rem' }}>6</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#047857' }}>Payment Status</h4>
            <p style={{ fontSize: '0.775rem', color: '#065f46', marginTop: '0.25rem' }}>Direct financial aid authorized</p>
          </div>
        </div>
      </section>

      {/* Non-Crypto Blockchain Security Explanation Section */}
      <section className="gov-card" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2.25rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
          <Layers size={36} color="#047857" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#065f46', marginBottom: '0.5rem' }}>
              Tamper-Evident Blockchain Record Keeping
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#047857', lineHeight: '1.6' }}>
              Blockchain maintains a tamper-evident record of important application, verification and approval events. Rather than storing sensitive personal details or cryptocurrency tokens on-chain, the system securely stores cryptographic document hashes and state transition timestamps on an immutable smart contract ledger.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Schemes Catalogue Preview */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0a192f' }}>Active Subsidy Schemes Directory</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Central and state government agricultural assistance programs.</p>
          </div>
          <button onClick={() => setActiveTab('schemes')} className="btn-gov-outline" style={{ fontSize: '0.85rem' }}>
            View Catalog <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {schemesPreview.map((scheme) => (
            <div key={scheme.id} className="gov-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-approved" style={{ marginBottom: '0.75rem' }}>Active Scheme</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0a192f', marginBottom: '0.25rem' }}>{scheme.title}</h3>
                <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{scheme.category}</div>
                <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '1rem', lineHeight: '1.5' }}>{scheme.desc}</p>
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#047857', marginBottom: '0.85rem' }}>Financial Aid: {scheme.benefit}</div>
                <button onClick={() => setActiveTab('schemes')} className="btn-gov-primary" style={{ width: '100%', fontSize: '0.825rem', padding: '0.5rem' }}>
                  View Guidelines & Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
