// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FarmerSubsidy
 * @notice Smart contract for managing farmer subsidy schemes, applications, officer verifications,
 * on-chain approval, payment release, and immutable document hash storage for auditability.
 */
contract FarmerSubsidy {
    // --- ENUMS ---
    enum ApplicationStatus {
        PENDING,
        VERIFIED,
        APPROVED,
        REJECTED
    }

    // --- STRUCTS ---
    struct Scheme {
        string schemeId;
        string name;
        string description;
        uint256 subsidyAmount;
        bool active;
        bool exists;
    }

    struct Application {
        string applicationId;
        address farmerWallet;
        string schemeId;
        uint256 subsidyAmount;
        string documentHash;
        uint256 timestamp;
        ApplicationStatus status;
        address verifiedByOfficer;
        string rejectionReason;
        bool isPaymentReleased;
        bool exists;
    }

    // --- STATE VARIABLES ---
    address public admin;
    mapping(address => bool) public officers;

    // Schemes: schemeId => Scheme
    mapping(string => Scheme) private schemes;
    string[] public schemeIds;

    // Applications: applicationId => Application
    mapping(string => Application) private applications;
    string[] public applicationIds;

    // Duplicate prevention: farmerWallet => schemeId => hasActiveOrApprovedApplication
    mapping(address => mapping(string => bool)) private farmerSchemeApplied;

    // --- EVENTS ---
    event OfficerAdded(address indexed officer);
    event OfficerRemoved(address indexed officer);
    event SchemeCreated(string indexed schemeId, string name, uint256 subsidyAmount);
    event SchemeStatusChanged(string indexed schemeId, bool active);
    event ApplicationSubmitted(
        string indexed applicationId,
        address indexed farmerWallet,
        string indexed schemeId,
        uint256 subsidyAmount,
        string documentHash,
        uint256 timestamp
    );
    event ApplicationVerified(string indexed applicationId, address indexed officer, uint256 timestamp);
    event ApplicationApproved(string indexed applicationId, address indexed officer, uint256 timestamp);
    event ApplicationRejected(string indexed applicationId, address indexed officer, string reason, uint256 timestamp);
    event PaymentReleased(
        string indexed applicationId,
        address indexed farmerWallet,
        uint256 subsidyAmount,
        address indexed releasedBy,
        uint256 timestamp
    );

    // --- MODIFIERS ---
    modifier onlyAdmin() {
        require(msg.sender == admin, "FarmerSubsidy: Only administrator can perform this action");
        _;
    }

    modifier onlyOfficer() {
        require(officers[msg.sender] || msg.sender == admin, "FarmerSubsidy: Only authorized officer or admin can perform this action");
        _;
    }

    // --- CONSTRUCTOR ---
    constructor() {
        admin = msg.sender;
    }

    // --- ROLE MANAGEMENT ---
    function addOfficer(address _officer) external onlyAdmin {
        require(_officer != address(0), "FarmerSubsidy: Invalid officer address");
        require(!officers[_officer], "FarmerSubsidy: Officer already authorized");
        officers[_officer] = true;
        emit OfficerAdded(_officer);
    }

    function removeOfficer(address _officer) external onlyAdmin {
        require(officers[_officer], "FarmerSubsidy: Officer not authorized");
        officers[_officer] = false;
        emit OfficerRemoved(_officer);
    }

    // --- SUBSIDY SCHEME MANAGEMENT ---
    function createScheme(
        string calldata _schemeId,
        string calldata _name,
        string calldata _description,
        uint256 _subsidyAmount
    ) external onlyAdmin {
        require(bytes(_schemeId).length > 0, "FarmerSubsidy: Scheme ID cannot be empty");
        require(bytes(_name).length > 0, "FarmerSubsidy: Scheme name cannot be empty");
        require(_subsidyAmount > 0, "FarmerSubsidy: Subsidy amount must be greater than zero");
        require(!schemes[_schemeId].exists, "FarmerSubsidy: Scheme ID already exists");

        schemes[_schemeId] = Scheme({
            schemeId: _schemeId,
            name: _name,
            description: _description,
            subsidyAmount: _subsidyAmount,
            active: true,
            exists: true
        });

        schemeIds.push(_schemeId);

        emit SchemeCreated(_schemeId, _name, _subsidyAmount);
        emit SchemeStatusChanged(_schemeId, true);
    }

    function setSchemeStatus(string calldata _schemeId, bool _active) external onlyAdmin {
        require(schemes[_schemeId].exists, "FarmerSubsidy: Scheme does not exist");
        require(schemes[_schemeId].active != _active, "FarmerSubsidy: Scheme already in target status");

        schemes[_schemeId].active = _active;
        emit SchemeStatusChanged(_schemeId, _active);
    }

    // --- APPLICATION SUBMISSION ---
    function submitApplication(
        string calldata _applicationId,
        string calldata _schemeId,
        string calldata _documentHash
    ) external {
        require(bytes(_applicationId).length > 0, "FarmerSubsidy: Application ID cannot be empty");
        require(bytes(_schemeId).length > 0, "FarmerSubsidy: Scheme ID cannot be empty");
        require(bytes(_documentHash).length > 0, "FarmerSubsidy: Document hash cannot be empty");
        require(!applications[_applicationId].exists, "FarmerSubsidy: Application ID already exists");

        Scheme memory scheme = schemes[_schemeId];
        require(scheme.exists, "FarmerSubsidy: Scheme does not exist");
        require(scheme.active, "FarmerSubsidy: Scheme is not active");

        require(!farmerSchemeApplied[msg.sender][_schemeId], "FarmerSubsidy: Active application already exists for this scheme");

        applications[_applicationId] = Application({
            applicationId: _applicationId,
            farmerWallet: msg.sender,
            schemeId: _schemeId,
            subsidyAmount: scheme.subsidyAmount,
            documentHash: _documentHash,
            timestamp: block.timestamp,
            status: ApplicationStatus.PENDING,
            verifiedByOfficer: address(0),
            rejectionReason: "",
            isPaymentReleased: false,
            exists: true
        });

        farmerSchemeApplied[msg.sender][_schemeId] = true;
        applicationIds.push(_applicationId);

        emit ApplicationSubmitted(
            _applicationId,
            msg.sender,
            _schemeId,
            scheme.subsidyAmount,
            _documentHash,
            block.timestamp
        );
    }

    // --- OFFICER VERIFICATION WORKFLOW ---
    function verifyApplication(string calldata _applicationId) external onlyOfficer {
        require(applications[_applicationId].exists, "FarmerSubsidy: Application does not exist");
        Application storage app = applications[_applicationId];

        require(app.status == ApplicationStatus.PENDING, "FarmerSubsidy: Application is not in PENDING status");

        app.status = ApplicationStatus.VERIFIED;
        app.verifiedByOfficer = msg.sender;

        emit ApplicationVerified(_applicationId, msg.sender, block.timestamp);
    }

    function approveApplication(string calldata _applicationId) external onlyOfficer {
        require(applications[_applicationId].exists, "FarmerSubsidy: Application does not exist");
        Application storage app = applications[_applicationId];

        require(app.status == ApplicationStatus.VERIFIED, "FarmerSubsidy: Application must be VERIFIED before approval");

        app.status = ApplicationStatus.APPROVED;
        app.verifiedByOfficer = msg.sender;

        emit ApplicationApproved(_applicationId, msg.sender, block.timestamp);
    }

    function rejectApplication(string calldata _applicationId, string calldata _reason) external onlyOfficer {
        require(applications[_applicationId].exists, "FarmerSubsidy: Application does not exist");
        require(bytes(_reason).length > 0, "FarmerSubsidy: Rejection reason cannot be empty");

        Application storage app = applications[_applicationId];
        require(
            app.status == ApplicationStatus.PENDING || app.status == ApplicationStatus.VERIFIED,
            "FarmerSubsidy: Application cannot be rejected in its current status"
        );

        app.status = ApplicationStatus.REJECTED;
        app.rejectionReason = _reason;
        app.verifiedByOfficer = msg.sender;

        // Reset duplicate flag upon rejection so farmer can re-apply if rectified
        farmerSchemeApplied[app.farmerWallet][app.schemeId] = false;

        emit ApplicationRejected(_applicationId, msg.sender, _reason, block.timestamp);
    }

    // --- SUBSIDY PAYMENT RELEASE WORKFLOW ---
    function releasePayment(string calldata _applicationId) external onlyOfficer {
        require(applications[_applicationId].exists, "FarmerSubsidy: Application does not exist");
        Application storage app = applications[_applicationId];

        require(app.status == ApplicationStatus.APPROVED, "FarmerSubsidy: Application must be APPROVED before payment release");
        require(!app.isPaymentReleased, "FarmerSubsidy: Payment has already been released for this application");

        app.isPaymentReleased = true;

        emit PaymentReleased(
            _applicationId,
            app.farmerWallet,
            app.subsidyAmount,
            msg.sender,
            block.timestamp
        );
    }

    // --- VIEW FUNCTIONS ---
    function getScheme(string calldata _schemeId)
        external
        view
        returns (
            string memory schemeId,
            string memory name,
            string memory description,
            uint256 subsidyAmount,
            bool active
        )
    {
        require(schemes[_schemeId].exists, "FarmerSubsidy: Scheme does not exist");
        Scheme memory s = schemes[_schemeId];
        return (s.schemeId, s.name, s.description, s.subsidyAmount, s.active);
    }

    function getApplication(string calldata _applicationId)
        external
        view
        returns (
            string memory applicationId,
            address farmerWallet,
            string memory schemeId,
            uint256 subsidyAmount,
            string memory documentHash,
            uint256 timestamp,
            ApplicationStatus status,
            address verifiedByOfficer,
            string memory rejectionReason,
            bool isPaymentReleased
        )
    {
        require(applications[_applicationId].exists, "FarmerSubsidy: Application does not exist");
        Application memory a = applications[_applicationId];
        return (
            a.applicationId,
            a.farmerWallet,
            a.schemeId,
            a.subsidyAmount,
            a.documentHash,
            a.timestamp,
            a.status,
            a.verifiedByOfficer,
            a.rejectionReason,
            a.isPaymentReleased
        );
    }

    function getApplicationStatus(string calldata _applicationId) external view returns (ApplicationStatus) {
        require(applications[_applicationId].exists, "FarmerSubsidy: Application does not exist");
        return applications[_applicationId].status;
    }

    function isPaymentReleased(string calldata _applicationId) external view returns (bool) {
        require(applications[_applicationId].exists, "FarmerSubsidy: Application does not exist");
        return applications[_applicationId].isPaymentReleased;
    }

    function getDocumentHash(string calldata _applicationId) external view returns (string memory) {
        require(applications[_applicationId].exists, "FarmerSubsidy: Application does not exist");
        return applications[_applicationId].documentHash;
    }

    function hasFarmerApplied(address _farmer, string calldata _schemeId) external view returns (bool) {
        return farmerSchemeApplied[_farmer][_schemeId];
    }

    function getSchemeCount() external view returns (uint256) {
        return schemeIds.length;
    }

    function getApplicationCount() external view returns (uint256) {
        return applicationIds.length;
    }
}
