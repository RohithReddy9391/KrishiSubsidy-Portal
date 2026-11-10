import React, { createContext, useContext, useState, useEffect } from 'react';
import { blockchain } from '../services/blockchain';
import { api } from '../services/api';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [activeRole, setActiveRole] = useState('farmer'); // 'farmer' | 'officer' | 'admin'
  const [activeTab, setActiveTab] = useState('landing');
  const [contractAddress, setContractAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  // Initial load: check API health and contract config
  useEffect(() => {
    api.getHealth()
      .then(res => {
        if (res.contractAddress && res.contractAddress !== 'Not Configured') {
          setContractAddress(res.contractAddress);
        }
      })
      .catch(() => {});

    // Listen for MetaMask account changes
    if (blockchain.isMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress('');
        }
      });
    }
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');
    try {
      const address = await blockchain.connectWallet();
      setWalletAddress(address);
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
  };

  return (
    <WalletContext.Provider value={{
      walletAddress,
      activeRole,
      setActiveRole,
      activeTab,
      setActiveTab,
      contractAddress,
      isConnecting,
      error,
      connectWallet,
      disconnectWallet
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
