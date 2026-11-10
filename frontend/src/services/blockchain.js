import { ethers } from 'ethers';
import { api } from './api.js';

// ABI definition from contract build artifact
export const FARMER_SUBSIDY_ABI = [
  "function admin() view returns (address)",
  "function officers(address) view returns (bool)",
  "function addOfficer(address _officer)",
  "function removeOfficer(address _officer)",
  "function createScheme(string _schemeId, string _name, string _description, uint256 _subsidyAmount)",
  "function setSchemeStatus(string _schemeId, bool _active)",
  "function submitApplication(string _applicationId, string _schemeId, string _documentHash)",
  "function verifyApplication(string _applicationId)",
  "function approveApplication(string _applicationId)",
  "function rejectApplication(string _applicationId, string _reason)",
  "function releasePayment(string _applicationId)",
  "function isPaymentReleased(string _applicationId) view returns (bool)",
  "function getScheme(string _schemeId) view returns (string, string, string, uint256, bool)",
  "function getApplication(string _applicationId) view returns (string, address, string, uint256, string, uint256, uint8, address, string, bool)",
  "function getApplicationStatus(string _applicationId) view returns (uint8)",
  "function getDocumentHash(string _applicationId) view returns (string)",
  "function hasFarmerApplied(address _farmer, string _schemeId) view returns (bool)",
  "function getSchemeCount() view returns (uint256)",
  "function getApplicationCount() view returns (uint256)",
  "event ApplicationSubmitted(string indexed applicationId, address indexed farmerWallet, string indexed schemeId, uint256 subsidyAmount, string documentHash, uint256 timestamp)",
  "event ApplicationVerified(string indexed applicationId, address indexed officer, uint256 timestamp)",
  "event ApplicationApproved(string indexed applicationId, address indexed officer, uint256 timestamp)",
  "event ApplicationRejected(string indexed applicationId, address indexed officer, string reason, uint256 timestamp)",
  "event PaymentReleased(string indexed applicationId, address indexed farmerWallet, uint256 subsidyAmount, address indexed releasedBy, uint256 timestamp)"
];

export const HARDHAT_CHAIN_ID = '0x7a69'; // 31337 in hex
export const DEFAULT_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

/**
 * MetaMask Web3 Integration Helper
 */
export const blockchain = {
  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && Boolean(window.ethereum);
  },

  // Connect wallet
  async connectWallet() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask browser extension to interact with the blockchain.');
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No Ethereum account selected.');
    }

    return accounts[0];
  },

  // Get Web3 Ethers Provider & Signer
  async getProviderAndSigner() {
    if (!this.isMetaMaskInstalled()) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return { provider, signer };
  },

  // Switch to Hardhat Local Network
  async switchToHardhatNetwork() {
    if (!this.isMetaMaskInstalled()) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HARDHAT_CHAIN_ID }]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: HARDHAT_CHAIN_ID,
            chainName: 'Hardhat Localhost',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['http://127.0.0.1:8545']
          }]
        });
      }
    }
  },

  // Step 1: Execute Officer Verification on Smart Contract via MetaMask (Sets Status = VERIFIED)
  async signVerifyApplicationOnChain(contractAddress, applicationId) {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install the MetaMask browser extension to verify applications.');
    }

    const { provider, signer } = await this.getProviderAndSigner();
    const userWallet = await signer.getAddress();
    const targetAddr = contractAddress || DEFAULT_CONTRACT_ADDRESS;

    // 1. Verify and Switch Network if needed (Hardhat Chain ID 31337)
    try {
      const network = await provider.getNetwork();
      if (network.chainId !== 31337n && network.chainId !== 31337) {
        console.log(`Current network ${network.chainId} is not Hardhat (31337). Switching network...`);
        await this.switchToHardhatNetwork();
      }
    } catch (netErr) {
      console.warn('Network check note:', netErr.message);
    }

    const currentNetwork = await provider.getNetwork();

    // 2. Instantiate Contract via Signer
    const contract = new ethers.Contract(targetAddr, FARMER_SUBSIDY_ABI, signer);

    // 3. Verify On-Chain Officer Authorization
    let isAuthorized = false;
    try {
      const adminAddr = await contract.admin();
      const isOfficer = await contract.officers(userWallet);
      isAuthorized = isOfficer || (userWallet.toLowerCase() === adminAddr.toLowerCase());
    } catch (authErr) {
      console.warn('On-chain authorization query note:', authErr.message);
    }

    // 4. Log required pre-flight details (Item 14)
    console.log('=== Pre-Flight Verification Check ===');
    console.log('Connected Wallet:', userWallet);
    console.log('Chain ID:', Number(currentNetwork.chainId));
    console.log('Contract Address:', targetAddr);
    console.log('Function Being Called:', 'verifyApplication');
    console.log('Application ID:', applicationId);
    console.log('Authorization Result:', isAuthorized ? 'Authorized (Officer/Admin)' : 'Unauthorized');

    if (!isAuthorized) {
      throw new Error(`Unauthorized Officer Wallet: Connected wallet (${userWallet.slice(0, 8)}...${userWallet.slice(-4)}) is not registered as an authorized officer on contract ${targetAddr}.`);
    }

    // 5. Ensure application is registered on-chain in PENDING status
    try {
      await api.seedOnChain(applicationId, 'PENDING');
    } catch (seedErr) {
      console.warn('api.seedOnChain warning:', seedErr.message);
    }

    // 6. Read On-Chain State to confirm application exists and is in PENDING (0)
    try {
      const appOnChain = await contract.getApplication(applicationId);
      if (!appOnChain || !appOnChain[0] || appOnChain[0] === '') {
        throw new Error(`Application ${applicationId} is not registered on the smart contract.`);
      }
      const onChainStatus = Number(appOnChain[6]);
      if (onChainStatus === 1) {
        console.log(`Application ${applicationId} is already VERIFIED on-chain.`);
        return { txHash: 'Already Verified On-Chain', blockNumber: null, officerWallet: userWallet };
      }
      if (onChainStatus !== 0) {
        const statusNames = ['PENDING', 'VERIFIED', 'APPROVED', 'REJECTED'];
        throw new Error(`Application ${applicationId} is currently in status ${statusNames[onChainStatus] || onChainStatus}. Expected PENDING for verification.`);
      }
    } catch (readErr) {
      if (readErr.message.includes('not registered') || readErr.message.includes('Expected PENDING')) {
        throw readErr;
      }
    }

    // 7. Prompt MetaMask Transaction & Await Receipt
    console.log(`Prompting MetaMask to verify application ${applicationId}...`);
    const tx = await contract.verifyApplication(applicationId);
    console.log(`Verification transaction submitted! Hash: ${tx.hash}`);
    const receipt = await tx.wait();

    if (receipt.status !== 1) {
      throw new Error('Blockchain transaction failed on-chain (status !== 1).');
    }

    return { txHash: tx.hash, blockNumber: receipt.blockNumber, officerWallet: userWallet };
  },

  // Step 2: Execute Officer Approval on Smart Contract via MetaMask (Sets Status = APPROVED, Payment = APPROVED_PAYMENT_PENDING)
  async signApproveApplicationOnChain(contractAddress, applicationId, appData = {}) {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install the MetaMask browser extension to approve claims.');
    }

    const { provider, signer } = await this.getProviderAndSigner();
    const userWallet = await signer.getAddress();
    const targetAddr = contractAddress || DEFAULT_CONTRACT_ADDRESS;

    // 1. Verify and Switch Network if needed
    try {
      const network = await provider.getNetwork();
      if (network.chainId !== 31337n && network.chainId !== 31337) {
        console.log(`Current network ${network.chainId} is not Hardhat (31337). Switching network...`);
        await this.switchToHardhatNetwork();
      }
    } catch (netErr) {
      console.warn('Network check note:', netErr.message);
    }

    const currentNetwork = await provider.getNetwork();

    // 2. Instantiate Contract via Signer
    const contract = new ethers.Contract(targetAddr, FARMER_SUBSIDY_ABI, signer);

    // 3. Verify On-Chain Officer Authorization
    let isAuthorized = false;
    try {
      const adminAddr = await contract.admin();
      const isOfficer = await contract.officers(userWallet);
      isAuthorized = isOfficer || (userWallet.toLowerCase() === adminAddr.toLowerCase());
    } catch (authErr) {
      console.warn('On-chain authorization query note:', authErr.message);
    }

    // 4. Log required pre-flight details (Item 14)
    console.log('=== Pre-Flight Approval Check ===');
    console.log('Connected Wallet:', userWallet);
    console.log('Chain ID:', Number(currentNetwork.chainId));
    console.log('Contract Address:', targetAddr);
    console.log('Function Being Called:', 'approveApplication');
    console.log('Application ID:', applicationId);
    console.log('Authorization Result:', isAuthorized ? 'Authorized (Officer/Admin)' : 'Unauthorized');

    if (!isAuthorized) {
      throw new Error(`Unauthorized Officer Wallet: Connected wallet (${userWallet.slice(0, 8)}...${userWallet.slice(-4)}) is not registered as an authorized officer on contract ${targetAddr}.`);
    }

    // 5. Ensure application is registered and in VERIFIED status on-chain before calling approve
    try {
      await api.seedOnChain(applicationId, 'VERIFIED');
    } catch (seedErr) {
      console.warn('api.seedOnChain warning:', seedErr.message);
    }

    // 6. Read On-Chain State to confirm application exists and is in VERIFIED (1)
    try {
      const appOnChain = await contract.getApplication(applicationId);
      if (!appOnChain || !appOnChain[0] || appOnChain[0] === '') {
        throw new Error(`Application ${applicationId} is not registered on the smart contract.`);
      }
      const onChainStatus = Number(appOnChain[6]);
      if (onChainStatus === 2) {
        console.log(`Application ${applicationId} is already APPROVED on-chain.`);
        return { txHash: 'Already Approved On-Chain', blockNumber: null, officerWallet: userWallet };
      }
      if (onChainStatus !== 1) {
        const statusNames = ['PENDING', 'VERIFIED', 'APPROVED', 'REJECTED'];
        throw new Error(`Application ${applicationId} is in status ${statusNames[onChainStatus] || onChainStatus}. Expected VERIFIED before approval.`);
      }
    } catch (readErr) {
      if (readErr.message.includes('not registered') || readErr.message.includes('Expected VERIFIED')) {
        throw readErr;
      }
    }

    // 7. Prompt MetaMask Transaction & Await Receipt
    console.log(`Prompting MetaMask to approve application ${applicationId}...`);
    const tx = await contract.approveApplication(applicationId);
    console.log(`Approval transaction submitted! Hash: ${tx.hash}`);
    const receipt = await tx.wait();

    if (receipt.status !== 1) {
      throw new Error('Blockchain transaction failed on-chain (status !== 1).');
    }

    return { txHash: tx.hash, blockNumber: receipt.blockNumber, officerWallet: userWallet };
  },

  // Action 2: Execute Subsidy Payment Release on Smart Contract via MetaMask (Sets Payment Status = PAYMENT_RELEASED)
  async signReleasePaymentOnChain(contractAddress, applicationId) {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is required to sign payment release transactions.');
    }

    const { provider, signer } = await this.getProviderAndSigner();
    const userWallet = await signer.getAddress();
    const targetAddr = contractAddress || DEFAULT_CONTRACT_ADDRESS;

    // 1. Verify Network (Hardhat Local Chain ID 31337)
    try {
      const network = await provider.getNetwork();
      if (network.chainId !== 31337n && network.chainId !== 31337) {
        console.log(`Current network ${network.chainId} is not Hardhat (31337). Switching network...`);
        await this.switchToHardhatNetwork();
      }
    } catch (netErr) {
      console.warn('Network verification note:', netErr.message);
    }

    const currentNetwork = await provider.getNetwork();
    const contract = new ethers.Contract(targetAddr, FARMER_SUBSIDY_ABI, signer);

    // 2. Verify On-Chain Authorization
    let isAuthorized = false;
    try {
      const adminAddr = await contract.admin();
      const isOfficer = await contract.officers(userWallet);
      isAuthorized = isOfficer || (userWallet.toLowerCase() === adminAddr.toLowerCase());
    } catch (authErr) {
      console.warn('On-chain authorization query note:', authErr.message);
    }

    // 3. Log required pre-flight details (Item 14)
    console.log('=== Pre-Flight Payment Release Check ===');
    console.log('Connected Wallet:', userWallet);
    console.log('Chain ID:', Number(currentNetwork.chainId));
    console.log('Contract Address:', targetAddr);
    console.log('Function Being Called:', 'releasePayment');
    console.log('Application ID:', applicationId);
    console.log('Authorization Result:', isAuthorized ? 'Authorized (Officer/Admin)' : 'Unauthorized');

    if (!isAuthorized) {
      throw new Error(`Unauthorized Wallet: Connected wallet (${userWallet.slice(0, 8)}...${userWallet.slice(-4)}) is not authorized to release subsidy payments on contract ${targetAddr}.`);
    }

    // 4. Synchronize / Pre-seed application on-chain with exact Application ID if needed
    try {
      await api.seedOnChain(applicationId, 'APPROVED');
    } catch (seedErr) {
      console.warn('api.seedOnChain warning:', seedErr.message);
    }

    // 5. Read On-Chain Application State
    try {
      const appOnChain = await contract.getApplication(applicationId);
      if (!appOnChain || !appOnChain[0] || appOnChain[0] === '') {
        throw new Error(`Application ${applicationId} is not registered on the current blockchain contract.`);
      }
      if (appOnChain[9] === true) {
        console.log(`Payment already released on-chain for ${applicationId}. Synchronizing backend...`);
        return { txHash: 'Already Confirmed On-Chain', blockNumber: null, releasedBy: userWallet };
      }
      const onChainStatus = Number(appOnChain[6]);
      if (onChainStatus !== 2) {
        const statusNames = ['PENDING', 'VERIFIED', 'APPROVED', 'REJECTED'];
        throw new Error(`Application ${applicationId} is in status ${statusNames[onChainStatus] || onChainStatus}. Expected APPROVED before releasing payment.`);
      }
    } catch (readErr) {
      if (readErr.message.includes('not registered') || readErr.message.includes('Expected APPROVED')) {
        throw readErr;
      }
    }

    // 6. Prompt MetaMask Transaction & Confirm Receipt
    console.log(`Prompting MetaMask for payment release of application ${applicationId}...`);
    const tx = await contract.releasePayment(applicationId);
    console.log(`Payment release transaction submitted! Hash: ${tx.hash}`);
    const receipt = await tx.wait();

    if (receipt.status !== 1) {
      throw new Error('Blockchain transaction was mined but returned status failed (status != 1).');
    }

    return { txHash: tx.hash, blockNumber: receipt.blockNumber, releasedBy: userWallet };
  },

  // Execute Officer Rejection on Smart Contract via MetaMask
  async signRejectApplicationOnChain(contractAddress, applicationId, reason) {
    const { signer } = await this.getProviderAndSigner();
    const contract = new ethers.Contract(contractAddress || DEFAULT_CONTRACT_ADDRESS, FARMER_SUBSIDY_ABI, signer);
    
    const tx = await contract.rejectApplication(applicationId, reason);
    const receipt = await tx.wait();
    return { txHash: tx.hash, blockNumber: receipt.blockNumber };
  }
};
