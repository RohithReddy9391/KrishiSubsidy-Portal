const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FarmerSubsidy Smart Contract", function () {
  let FarmerSubsidy;
  let farmerSubsidy;
  let admin;
  let officer1;
  let officer2;
  let farmer1;
  let farmer2;
  let unauthorizedUser;

  const SCHEME_ID_1 = "SCHEME-FERT-2026";
  const SCHEME_NAME_1 = "Fertilizer Subsidy Scheme 2026";
  const SCHEME_DESC_1 = "Subsidy for purchasing organic fertilizers";
  const SUBSIDY_AMOUNT_1 = ethers.parseEther("5000");

  const APP_ID_1 = "APP-2026-0001";
  const APP_ID_2 = "APP-2026-0002";
  const DOC_HASH_1 = "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const DOC_HASH_2 = "0x8f4b2a7c9e102938475610293847561029384756102938475610293847561029";

  beforeEach(async function () {
    [admin, officer1, officer2, farmer1, farmer2, unauthorizedUser] = await ethers.getSigners();

    FarmerSubsidy = await ethers.getContractFactory("FarmerSubsidy");
    farmerSubsidy = await FarmerSubsidy.deploy();
    await farmerSubsidy.waitForDeployment();
  });

  describe("1. Deployment & Roles", function () {
    it("Should set the deployer as the initial administrator", async function () {
      expect(await farmerSubsidy.admin()).to.equal(admin.address);
    });

    it("Should allow admin to add and remove an officer", async function () {
      await expect(farmerSubsidy.connect(admin).addOfficer(officer1.address))
        .to.emit(farmerSubsidy, "OfficerAdded")
        .withArgs(officer1.address);

      expect(await farmerSubsidy.officers(officer1.address)).to.be.true;

      await expect(farmerSubsidy.connect(admin).removeOfficer(officer1.address))
        .to.emit(farmerSubsidy, "OfficerRemoved")
        .withArgs(officer1.address);

      expect(await farmerSubsidy.officers(officer1.address)).to.be.false;
    });

    it("Should reject adding zero address as officer", async function () {
      await expect(
        farmerSubsidy.connect(admin).addOfficer(ethers.ZeroAddress)
      ).to.be.revertedWith("FarmerSubsidy: Invalid officer address");
    });

    it("Should reject unauthorized users from managing officers", async function () {
      await expect(
        farmerSubsidy.connect(unauthorizedUser).addOfficer(officer1.address)
      ).to.be.revertedWith("FarmerSubsidy: Only administrator can perform this action");
    });
  });

  describe("2. Subsidy Scheme Management", function () {
    it("Should allow admin to create a subsidy scheme and emit events", async function () {
      await expect(
        farmerSubsidy.connect(admin).createScheme(
          SCHEME_ID_1,
          SCHEME_NAME_1,
          SCHEME_DESC_1,
          SUBSIDY_AMOUNT_1
        )
      )
        .to.emit(farmerSubsidy, "SchemeCreated")
        .withArgs(SCHEME_ID_1, SCHEME_NAME_1, SUBSIDY_AMOUNT_1);

      const scheme = await farmerSubsidy.getScheme(SCHEME_ID_1);
      expect(scheme.schemeId).to.equal(SCHEME_ID_1);
      expect(scheme.name).to.equal(SCHEME_NAME_1);
      expect(scheme.description).to.equal(SCHEME_DESC_1);
      expect(scheme.subsidyAmount).to.equal(SUBSIDY_AMOUNT_1);
      expect(scheme.active).to.be.true;
      expect(await farmerSubsidy.getSchemeCount()).to.equal(1);
    });

    it("Should allow admin to activate and deactivate a scheme", async function () {
      await farmerSubsidy.connect(admin).createScheme(
        SCHEME_ID_1,
        SCHEME_NAME_1,
        SCHEME_DESC_1,
        SUBSIDY_AMOUNT_1
      );

      await expect(farmerSubsidy.connect(admin).setSchemeStatus(SCHEME_ID_1, false))
        .to.emit(farmerSubsidy, "SchemeStatusChanged")
        .withArgs(SCHEME_ID_1, false);

      let scheme = await farmerSubsidy.getScheme(SCHEME_ID_1);
      expect(scheme.active).to.be.false;

      await expect(farmerSubsidy.connect(admin).setSchemeStatus(SCHEME_ID_1, true))
        .to.emit(farmerSubsidy, "SchemeStatusChanged")
        .withArgs(SCHEME_ID_1, true);

      scheme = await farmerSubsidy.getScheme(SCHEME_ID_1);
      expect(scheme.active).to.be.true;
    });

    it("Should reject creating duplicate scheme IDs", async function () {
      await farmerSubsidy.connect(admin).createScheme(
        SCHEME_ID_1,
        SCHEME_NAME_1,
        SCHEME_DESC_1,
        SUBSIDY_AMOUNT_1
      );

      await expect(
        farmerSubsidy.connect(admin).createScheme(
          SCHEME_ID_1,
          "Duplicate Scheme",
          "Description",
          SUBSIDY_AMOUNT_1
        )
      ).to.be.revertedWith("FarmerSubsidy: Scheme ID already exists");
    });

    it("Should reject scheme creation by non-admin", async function () {
      await expect(
        farmerSubsidy.connect(farmer1).createScheme(
          SCHEME_ID_1,
          SCHEME_NAME_1,
          SCHEME_DESC_1,
          SUBSIDY_AMOUNT_1
        )
      ).to.be.revertedWith("FarmerSubsidy: Only administrator can perform this action");
    });
  });

  describe("3. Application Submission & Duplicate Prevention", function () {
    beforeEach(async function () {
      await farmerSubsidy.connect(admin).createScheme(
        SCHEME_ID_1,
        SCHEME_NAME_1,
        SCHEME_DESC_1,
        SUBSIDY_AMOUNT_1
      );
    });

    it("Should allow a farmer to submit an application and emit ApplicationSubmitted event", async function () {
      await expect(
        farmerSubsidy.connect(farmer1).submitApplication(APP_ID_1, SCHEME_ID_1, DOC_HASH_1)
      ).to.emit(farmerSubsidy, "ApplicationSubmitted");

      const app = await farmerSubsidy.getApplication(APP_ID_1);
      expect(app.applicationId).to.equal(APP_ID_1);
      expect(app.farmerWallet).to.equal(farmer1.address);
      expect(app.schemeId).to.equal(SCHEME_ID_1);
      expect(app.subsidyAmount).to.equal(SUBSIDY_AMOUNT_1);
      expect(app.documentHash).to.equal(DOC_HASH_1);
      expect(app.status).to.equal(0);
      expect(await farmerSubsidy.getApplicationCount()).to.equal(1);
    });

    it("Should reject duplicate application submission by the same farmer for the same scheme", async function () {
      await farmerSubsidy.connect(farmer1).submitApplication(APP_ID_1, SCHEME_ID_1, DOC_HASH_1);

      await expect(
        farmerSubsidy.connect(farmer1).submitApplication(APP_ID_2, SCHEME_ID_1, DOC_HASH_2)
      ).to.be.revertedWith("FarmerSubsidy: Active application already exists for this scheme");
    });

    it("Should reject submission for non-existent or inactive schemes", async function () {
      await expect(
        farmerSubsidy.connect(farmer1).submitApplication(APP_ID_1, "NON-EXISTENT-SCHEME", DOC_HASH_1)
      ).to.be.revertedWith("FarmerSubsidy: Scheme does not exist");

      await farmerSubsidy.connect(admin).setSchemeStatus(SCHEME_ID_1, false);

      await expect(
        farmerSubsidy.connect(farmer1).submitApplication(APP_ID_1, SCHEME_ID_1, DOC_HASH_1)
      ).to.be.revertedWith("FarmerSubsidy: Scheme is not active");
    });
  });

  describe("4. Officer Verification, Approval & Rejection Workflow", function () {
    beforeEach(async function () {
      await farmerSubsidy.connect(admin).addOfficer(officer1.address);
      await farmerSubsidy.connect(admin).createScheme(
        SCHEME_ID_1,
        SCHEME_NAME_1,
        SCHEME_DESC_1,
        SUBSIDY_AMOUNT_1
      );
      await farmerSubsidy.connect(farmer1).submitApplication(APP_ID_1, SCHEME_ID_1, DOC_HASH_1);
    });

    it("Should transition application from PENDING to VERIFIED by an officer", async function () {
      await expect(farmerSubsidy.connect(officer1).verifyApplication(APP_ID_1))
        .to.emit(farmerSubsidy, "ApplicationVerified");

      const status = await farmerSubsidy.getApplicationStatus(APP_ID_1);
      expect(status).to.equal(1);
    });

    it("Should transition application from VERIFIED to APPROVED by an officer", async function () {
      await farmerSubsidy.connect(officer1).verifyApplication(APP_ID_1);

      await expect(farmerSubsidy.connect(officer1).approveApplication(APP_ID_1))
        .to.emit(farmerSubsidy, "ApplicationApproved");

      const status = await farmerSubsidy.getApplicationStatus(APP_ID_1);
      expect(status).to.equal(2);
    });

    it("Should reject direct approval of a PENDING application (Invalid State Transition)", async function () {
      await expect(
        farmerSubsidy.connect(officer1).approveApplication(APP_ID_1)
      ).to.be.revertedWith("FarmerSubsidy: Application must be VERIFIED before approval");
    });

    it("Should allow officer to reject a PENDING or VERIFIED application with reason", async function () {
      const reason = "Ineligible land size documentation";

      await expect(farmerSubsidy.connect(officer1).rejectApplication(APP_ID_1, reason))
        .to.emit(farmerSubsidy, "ApplicationRejected");

      const app = await farmerSubsidy.getApplication(APP_ID_1);
      expect(app.status).to.equal(3);
      expect(app.rejectionReason).to.equal(reason);
    });

    it("Should reset duplicate flag when application is rejected, allowing re-submission", async function () {
      await farmerSubsidy.connect(officer1).rejectApplication(APP_ID_1, "Incorrect document");

      expect(await farmerSubsidy.hasFarmerApplied(farmer1.address, SCHEME_ID_1)).to.be.false;

      await expect(
        farmerSubsidy.connect(farmer1).submitApplication(APP_ID_2, SCHEME_ID_1, DOC_HASH_2)
      ).to.emit(farmerSubsidy, "ApplicationSubmitted");
    });

    it("Should reject verification or approval by unauthorized users", async function () {
      await expect(
        farmerSubsidy.connect(unauthorizedUser).verifyApplication(APP_ID_1)
      ).to.be.revertedWith("FarmerSubsidy: Only authorized officer or admin can perform this action");

      await expect(
        farmerSubsidy.connect(unauthorizedUser).approveApplication(APP_ID_1)
      ).to.be.revertedWith("FarmerSubsidy: Only authorized officer or admin can perform this action");
    });
  });

  describe("5. View Functions & Document Hash Retrieval", function () {
    beforeEach(async function () {
      await farmerSubsidy.connect(admin).createScheme(
        SCHEME_ID_1,
        SCHEME_NAME_1,
        SCHEME_DESC_1,
        SUBSIDY_AMOUNT_1
      );
      await farmerSubsidy.connect(farmer1).submitApplication(APP_ID_1, SCHEME_ID_1, DOC_HASH_1);
    });

    it("Should correctly retrieve stored document hash", async function () {
      expect(await farmerSubsidy.getDocumentHash(APP_ID_1)).to.equal(DOC_HASH_1);
    });

    it("Should return correct application and scheme counts", async function () {
      expect(await farmerSubsidy.getSchemeCount()).to.equal(1);
      expect(await farmerSubsidy.getApplicationCount()).to.equal(1);
    });
  });
});
