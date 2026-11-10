import React, { useEffect } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { SchemesPage } from './pages/SchemesPage';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { VerificationPage } from './pages/VerificationPage';

const MainContent = () => {
  const { activeTab, setActiveTab } = useWallet();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const appIdParam = params.get('appId') || params.get('id');

    if (tabParam === 'verify' || appIdParam) {
      setActiveTab('verify');
    }
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'schemes':
        return <SchemesPage />;
      case 'farmer':
        return <FarmerDashboard />;
      case 'officer':
        return <OfficerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'verify':
        return <VerificationPage />;
      case 'landing':
      default:
        return <LandingPage />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      <Navbar />
      <main className="container" style={{ flex: 1 }}>
        {renderTab()}
      </main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <WalletProvider>
      <MainContent />
    </WalletProvider>
  );
}

export default App;
