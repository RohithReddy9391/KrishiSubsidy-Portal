const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const defaultSchemes = [
  { schemeId: 'AP-YSR-RYTHU-BHAROSA', name: 'AP YSR Rythu Bharosa', subsidyAmount: 13500 },
  { schemeId: 'AP-YSR-SUNNA-VADDI', name: 'AP YSR Sunna Vaddi', subsidyAmount: 10000 },
  { schemeId: 'AP-YSR-CROP-INSURANCE', name: 'AP YSR Free Crop Insurance', subsidyAmount: 15000 },
  { schemeId: 'AP-PMKSY-MICRO-IRRIGATION', name: 'AP Micro Irrigation', subsidyAmount: 50000 },
  { schemeId: 'AP-SEED-BIO-FERTILIZER', name: 'AP Seed & Bio-Fertilizer', subsidyAmount: 8000 },
  { schemeId: 'AP-PEST-MANAGEMENT', name: 'AP Integrated Pest Protection', subsidyAmount: 7500 },
  { schemeId: 'AP-JALAKALA-BOREWELL', name: 'AP YSR Jalakala Free Borewell', subsidyAmount: 40000 },
  { schemeId: 'AP-SOLAR-FENCING', name: 'AP Solar Agricultural Fencing', subsidyAmount: 30000 },
  { schemeId: 'AP-SOLAR-DRYER', name: 'AP Solar Poly-House Dryer', subsidyAmount: 35000 },
  { schemeId: 'AP-RURAL-GODOWN', name: 'AP RBK Mini-Godown Scheme', subsidyAmount: 42000 },
  { schemeId: 'AP-COLD-STORAGE-CHAMBER', name: 'AP On-Farm Solar Cold Chamber', subsidyAmount: 38000 },
  { schemeId: 'PM-KISAN-NATIONAL', name: 'PM-KISAN National', subsidyAmount: 6000 },
  { schemeId: 'PMFBY-NATIONAL', name: 'PMFBY Central Insurance', subsidyAmount: 15000 },
  { schemeId: 'PM-KUSUM-NATIONAL', name: 'PM-KUSUM Solar Pumps', subsidyAmount: 45000 },
  { schemeId: 'PMKSY-CENTRAL-IRRIGATION', name: 'PMKSY Central Irrigation', subsidyAmount: 25000 },
  { schemeId: 'SCHEME-FERT-2026', name: 'Fertilizer Subsidy Scheme 2026', subsidyAmount: 5000 },
  { schemeId: 'SCHEME-SEED-2026', name: 'Certified Seed Scheme 2026', subsidyAmount: 3500 },
  { schemeId: 'AIF-2026-STORAGE', name: 'AIF Cold Storage Scheme', subsidyAmount: 50000 }
];

async function main() {
  console.log("Deploying FarmerSubsidy contract to local network...");

  const FarmerSubsidy = await hre.ethers.getContractFactory("FarmerSubsidy");
  const farmerSubsidy = await FarmerSubsidy.deploy();
  await farmerSubsidy.waitForDeployment();

  const targetAddress = await farmerSubsidy.getAddress();
  console.log("FarmerSubsidy contract deployed successfully to address:", targetAddress);

  // Authorize Officer Account
  const officerAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
  const txAuth = await farmerSubsidy.addOfficer(officerAddress);
  await txAuth.wait();
  console.log(`Officer authorized on-chain: ${officerAddress}`);

  // Seed all 18 schemes on-chain
  console.log("Pre-seeding all 18 schemes on smart contract...");
  for (const s of defaultSchemes) {
    try {
      const tx = await farmerSubsidy.createScheme(s.schemeId, s.name, `${s.name} Official Scheme`, s.subsidyAmount);
      await tx.wait();
      console.log(`  ✓ Seeding scheme: ${s.schemeId}`);
    } catch (err) {
      console.warn(`  ⚠️ Scheme ${s.schemeId} creation note: ${err.message}`);
    }
  }

  // Define backend export directories
  const backendConfigDir = path.join(__dirname, "../../backend/config");
  if (!fs.existsSync(backendConfigDir)) {
    fs.mkdirSync(backendConfigDir, { recursive: true });
  }

  // Get compiled artifact ABI
  const contractArtifact = await hre.artifacts.readArtifact("FarmerSubsidy");

  const configData = {
    address: targetAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  // Export contract deployment config
  fs.writeFileSync(
    path.join(backendConfigDir, "contractConfig.json"),
    JSON.stringify(configData, null, 2)
  );

  // Export contract ABI
  fs.writeFileSync(
    path.join(backendConfigDir, "FarmerSubsidyABI.json"),
    JSON.stringify(contractArtifact.abi, null, 2)
  );

  console.log("Contract deployment config and ABI successfully exported to backend/config/");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
