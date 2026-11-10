# PROJECT SPECIFICATION

## Project Title

**Design and Development of a Blockchain-Based Farmer Subsidy Distribution System**

## Research Domain

Blockchain Technology

## Application Domain

Agriculture / E-Governance / Public Subsidy Management

## 1. Project Overview

The proposed system is a blockchain-based web application designed to improve transparency, traceability, integrity, and accountability in farmer subsidy distribution.

The system allows farmers to register and apply for eligible government subsidy schemes. Government officers verify farmer eligibility, submitted information, and supporting documents before approving or rejecting applications. Administrators manage subsidy schemes and monitor the overall system.

The system uses a hybrid storage architecture. General and sensitive farmer information is stored in an off-chain database, while important subsidy-related records are recorded on a blockchain through smart contracts.

Cryptographic document hashes are recorded on-chain to provide document integrity verification without storing actual documents on the blockchain.

The system also maintains an immutable audit trail of important subsidy activities and provides dashboards for farmers, government officers, and administrators.

This project is an academic research prototype and is not intended to represent a production-level government platform.

## 2. Real-World Problem

Traditional subsidy distribution systems may face problems such as:

* Lack of transparency in application processing
* Difficulty tracking application history
* Unauthorized modification of records
* Duplicate subsidy applications
* Delayed verification
* Limited visibility for farmers
* Difficulty maintaining reliable audit trails
* Dependence on centralized record management
* Difficulty proving the integrity of submitted documents

The proposed system addresses these issues using blockchain for records that require integrity, traceability, and tamper-evidence.

## 3. Main Objective

The main objective is to design and develop a blockchain-based subsidy management system that provides:

* Transparent subsidy processing
* Traceable application history
* Tamper-evident records
* Document integrity verification
* Duplicate subsidy prevention
* Role-based access
* Immutable audit trails
* Farmer application tracking
* Administrative monitoring

## 4. Stakeholders

### Farmer

The farmer can:

* Register
* Connect a blockchain wallet
* View available subsidy schemes
* Apply for eligible subsidies
* Upload supporting documents
* View eligibility status
* Track applications
* View approval or rejection
* View blockchain transaction information
* Verify document integrity

### Government Officer

The officer can:

* View submitted applications
* Review farmer information
* Check eligibility
* Verify documents
* Check previous subsidy records
* Approve applications
* Reject applications with reasons
* View application history
* View blockchain transaction records

### Administrator

The administrator can:

* Create subsidy schemes
* Activate or deactivate schemes
* Define subsidy amounts
* Manage officers
* Monitor farmers
* Monitor applications
* View system statistics
* Monitor subsidy distribution
* View audit and blockchain records

## 5. Core Functional Modules

### Module 1 — Farmer Registration

The system collects:

* Farmer ID
* Name
* Contact information
* Location
* Land information
* Crop information
* Wallet address

### Module 2 — Subsidy Scheme Management

The administrator can create schemes containing:

* Scheme ID
* Scheme name
* Description
* Subsidy amount
* Eligibility criteria
* Active/inactive status

### Module 3 — Subsidy Application

The farmer:

1. Selects a subsidy scheme
2. Enters required information
3. Uploads supporting documents
4. Submits the application

The system generates a unique application ID.

### Module 4 — Eligibility Verification

The system checks:

* Farmer registration
* Land information
* Crop information
* Scheme requirements
* Required documents
* Previous subsidy records

Possible results:

* Eligible
* Not Eligible
* Requires Verification

### Module 5 — Document Integrity Verification

Actual documents remain off-chain.

A cryptographic hash is generated from the document.

Process:

Document → Cryptographic Hash → Blockchain Record

For later verification:

Current Document → New Hash → Compare with Blockchain Hash

If the hashes match, document integrity is confirmed.

If they do not match, the document may have been modified.

### Module 6 — Duplicate Subsidy Prevention

The system prevents a farmer from applying for the same subsidy scheme more than once during the defined subsidy period.

Process:

Farmer + Subsidy Scheme → Check Existing Application → Allow or Reject

### Module 7 — Officer Verification

The officer reviews the application and can:

* Verify
* Approve
* Reject

If rejected, a rejection reason should be recorded.

### Module 8 — Blockchain Recording

Important subsidy records are recorded through smart contracts.

On-chain information includes:

* Application ID
* Farmer wallet address
* Subsidy scheme ID
* Subsidy amount
* Application status
* Timestamp
* Document hash
* Important transaction/event information

### Module 9 — Audit Trail

Important events should be traceable:

Application Submitted → Eligibility Verified → Documents Verified → Officer Decision → Blockchain Transaction → Final Status

### Module 10 — Blockchain Verification

A dedicated verification page allows a user to enter an application ID and view:

* Application status
* Subsidy scheme
* Subsidy amount
* Blockchain transaction information
* Timestamp
* Document hash
* Verification result

## 6. Dashboard System

### Farmer Dashboard

Display:

* Farmer profile
* Available subsidy schemes
* Apply for subsidy
* My applications
* Pending applications
* Approved applications
* Rejected applications
* Application timeline
* Blockchain transaction details

### Officer Dashboard

Display:

* Pending applications
* Applications requiring verification
* Eligible applications
* Approved applications
* Rejected applications
* Application details
* Document verification
* Audit history

### Administrator Dashboard

Display:

* Total farmers
* Total officers
* Total subsidy schemes
* Total applications
* Pending applications
* Approved applications
* Rejected applications
* Total subsidy amount
* Scheme management
* System activity
* Blockchain transaction statistics

Charts may show:

* Application status
* Subsidy distribution
* Scheme-wise applications
* Application trends

## 7. Proposed Architecture

The system follows a layered architecture:

Users → Dashboards → Subsidy Management → Eligibility and Document Verification → Smart Contract → Blockchain Layer → Consensus Layer → Validated Ledger → Audit and Verification

The architecture must explicitly contain:

### User Layer

* Farmer
* Government Officer
* Administrator

### Dashboard Layer

* Farmer Dashboard
* Officer Dashboard
* Administrator Dashboard

### Subsidy Management Layer

* Registration
* Subsidy Application
* Eligibility Verification
* Document Verification
* Duplicate Detection
* Officer Verification
* Approval/Rejection
* Status Tracking

### Data Management Layer

Off-chain data:

* Farmer information
* Land information
* Crop information
* Documents
* Application metadata
* Scheme information

On-chain data:

* Application ID
* Wallet address
* Scheme ID
* Subsidy amount
* Status
* Timestamp
* Document hash
* Transaction records

### Blockchain Layer

The blockchain layer contains:

* Distributed ledger
* Smart contract
* Immutable records
* Transaction validation
* Blockchain events
* Block creation

### Consensus Layer

The proposed permissioned/private deployment uses **Proof of Authority (PoA)** conceptually.

Consensus flow:

Transaction → Transaction Validation → Authorized Validator → Consensus Agreement → Block Validation → Block Added to Ledger

The local blockchain environment is a development prototype and must not be described as a production government blockchain.

### Audit and Verification Layer

Contains:

* Immutable audit trail
* Transaction history
* Document integrity verification
* Subsidy verification
* Transparent records

## 8. Hybrid Storage Architecture

### Off-Chain Database

Store:

* Farmer profile
* Contact information
* Land details
* Crop information
* Actual documents
* Application metadata
* Scheme information

Reason:

These records can be large, sensitive, or frequently updated.

### Blockchain

Store:

* Application ID
* Farmer wallet address
* Scheme ID
* Subsidy amount
* Application status
* Timestamp
* Document hash
* Important transaction/event records

Reason:

These records benefit from:

* Immutability
* Traceability
* Tamper-evidence
* Independent verification

Actual documents and sensitive personal information must not be stored directly on the blockchain.

## 9. Technology Stack

### Frontend

React

### Backend

Node.js and Express

### Database

MongoDB

### Blockchain

Ethereum-compatible local blockchain

### Smart Contract

Solidity

### Local Blockchain

Ganache

### Wallet

MetaMask

### Blockchain Communication

ethers.js

## 10. Security Requirements

The system should include:

* Role-based access control
* Smart-contract authorization
* Input validation
* Duplicate application prevention
* Cryptographic document hashing
* Secure environment variables
* Protection of private keys
* Protection of wallet seed phrases
* Auditability
* Proper authentication and authorization

Private keys, wallet seed phrases, passwords, and database credentials must never be included in source code or shared with AI tools.

## 11. Functional Requirements

The system shall:

1. Allow farmer registration.
2. Allow wallet connection.
3. Display available subsidy schemes.
4. Allow farmers to submit applications.
5. Generate application IDs.
6. Store application information.
7. Verify eligibility.
8. Verify documents.
9. Prevent duplicate subsidy applications.
10. Allow officers to approve or reject applications.
11. Record important events on blockchain.
12. Generate document hashes.
13. Provide blockchain verification.
14. Maintain audit history.
15. Provide farmer dashboard.
16. Provide officer dashboard.
17. Provide administrator dashboard.
18. Provide system statistics.

## 12. Non-Functional Requirements

### Security

Unauthorized users must not access restricted functions.

### Transparency

Authorized users should be able to trace application progress.

### Integrity

Blockchain records should be tamper-evident.

### Availability

The system should operate reliably during testing and demonstration.

### Scalability

The architecture should allow additional subsidy schemes and users.

### Usability

The interface should be simple and understandable.

### Maintainability

Frontend, backend, database, and blockchain components should remain modular.

## 13. Research Contributions

The project aims to contribute:

1. A hybrid on-chain/off-chain architecture for farmer subsidy management.
2. Blockchain-based subsidy application traceability.
3. Document integrity verification using cryptographic hashes.
4. Smart-contract-based duplicate subsidy prevention.
5. Role-based subsidy verification and approval.
6. An immutable audit trail for important subsidy events.
7. A blockchain verification interface for subsidy records.

## 14. Research Evaluation

The system should be experimentally evaluated using actual measurements.

Possible metrics:

* Transaction confirmation time
* Application processing time
* Blockchain verification time
* Document hash verification time
* Duplicate application detection
* Successful transaction count
* Failed transaction count
* Unauthorized transaction rejection
* System response time
* Transaction/gas cost where applicable

No performance numbers should be invented. All numerical findings must come from actual experiments.

## 15. Limitations

The project should acknowledge:

* Local blockchain is not equivalent to a production government network.
* Real government identity verification is not implemented.
* Real banking/payment integration is outside the prototype.
* Real government APIs are not integrated.
* Blockchain has scalability and storage limitations.
* Sensitive data should not be stored directly on-chain.
* Actual subsidy rules may vary between schemes.
* The prototype uses test/simulated data.

## 16. Future Enhancements

Possible future enhancements include:

* Government identity integration
* Real bank/payment integration
* Permissioned blockchain deployment
* Multiple government departments
* Mobile application
* SMS/email notifications
* Agricultural database interoperability
* Advanced fraud analytics
* Cloud deployment
* Real-world pilot testing

These should not be implemented unless specifically required.

## 17. Features That Must Not Be Added

Do not unnecessarily add:

* AI/ML prediction
* IoT sensors
* Satellite imagery
* Cryptocurrency/token systems
* Real banking transactions
* Aadhaar integration
* Complex DAO governance
* Unnecessary technologies

## 18. Final End-to-End Workflow

Admin creates subsidy scheme

↓

Farmer registers

↓

Farmer connects wallet

↓

Farmer views available schemes

↓

Farmer submits subsidy application

↓

System checks eligibility

↓

Documents are verified

↓

Application is submitted for officer review

↓

Officer reviews
