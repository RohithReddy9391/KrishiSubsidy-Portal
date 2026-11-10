# System Architecture Overview

## Project Title
Design and Development of a Blockchain-Based Farmer Subsidy Distribution System

## System Layers
1. **User Layer**: Farmer, Government Officer, Administrator.
2. **Dashboard Layer**: Farmer Dashboard, Officer Dashboard, Admin Dashboard, Public Verification Page.
3. **Subsidy Management Layer**: Registration, Subsidy Application, Eligibility Verification Engine, Document SHA-256 Hashing, Officer Approval, Duplicate Prevention.
4. **Data Management Layer (Off-Chain)**: MongoDB database & Local Storage for supporting documents.
5. **Blockchain Layer (On-Chain)**: Solidity Smart Contract (`SubsidyRegistry.sol`) running on local Ethereum-compatible network (Ganache).
6. **Consensus Layer**: Proof of Authority (PoA) concept for permissioned e-governance transactions.

## Hybrid Storage Model
* **Off-Chain (MongoDB)**: Sensitive personal metadata, land details, crop details, raw document files, rejection explanations.
* **On-Chain (Blockchain)**: Application ID, Farmer Wallet Address, Scheme ID, Subsidy Amount, Cryptographic SHA-256 Document Hash, Application Status Code, Officer Wallet Address, Timestamp.
