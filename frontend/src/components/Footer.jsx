import React from 'react';
import { ShieldCheck, Landmark } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#0b2545', color: '#cbd5e1', padding: '2.5rem 0 1.5rem', marginTop: '4rem', borderTop: '4px solid #134074' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffffff', fontWeight: '800', fontSize: '1.1rem' }}>
          <Landmark size={22} color="#0284c7" /> Blockchain-Based Farmer Subsidy Distribution System
        </div>
        <p style={{ maxWidth: '720px', fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6' }}>
          An academic research prototype designed to improve transparency, traceability, and document integrity in agricultural subsidy management through smart contracts and cryptographic SHA-256 document verification.
        </p>
        <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #1e293b', paddingTop: '1rem', width: '100%', maxWidth: '800px' }}>
          Academic Research Prototype • Local Ethereum Network • SHA-256 Cryptographic Hash Engine
        </div>
      </div>
    </footer>
  );
};
