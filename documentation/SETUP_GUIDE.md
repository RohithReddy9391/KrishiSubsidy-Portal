# Setup Guide & Development Instructions

## Prerequisites
* Node.js (v18+)
* npm (v9+)
* Ganache / Local Ethereum Node (Port 8545)
* MongoDB (Port 27017)
* MetaMask browser extension

## Directory Structure
```
Farmer-Subsidy-Blockchain/
├── frontend/        # React SPA (Vite)
├── backend/         # Node.js + Express API
├── contracts/       # Hardhat + Solidity Smart Contracts
└── documentation/   # Architecture & API Guides
```

## Running Components

### 1. Backend Server
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```

### 3. Smart Contracts Development
```bash
cd contracts
npm install
npx hardhat compile
```
