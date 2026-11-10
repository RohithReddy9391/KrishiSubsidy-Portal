# API Endpoint Specification

## Authentication
* `POST /api/auth/register` - User registration (Farmer / Officer)
* `POST /api/auth/login` - User login & JWT issuance
* `GET /api/auth/me` - Authenticated user profile

## Schemes
* `GET /api/schemes` - List active subsidy schemes
* `POST /api/schemes` - Admin: Create new scheme
* `PATCH /api/schemes/:id/status` - Admin: Activate/deactivate scheme

## Applications
* `POST /api/applications` - Farmer: Submit application with document upload
* `GET /api/applications/farmer` - Farmer: Retrieve own applications
* `GET /api/applications/officer` - Officer: Review application queue
* `GET /api/applications/:id` - Detailed application view
* `POST /api/applications/:id/verify-eligibility` - Run automated eligibility check
* `POST /api/applications/:id/verify-document` - Execute SHA-256 document hash check
* `POST /api/applications/:id/decision` - Officer: Approve or Reject application

## Public Verification & Admin
* `GET /api/verify/:applicationId` - Public: Verify application on-chain & off-chain records
* `GET /api/admin/stats` - Admin: Aggregate dashboard analytics
* `GET /api/admin/audit-logs` - Admin: View system audit trails
