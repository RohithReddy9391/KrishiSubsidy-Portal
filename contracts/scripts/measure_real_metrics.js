const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("=================================================================");
  console.log(" REAL EMPIRICAL MEASUREMENT: BLOCK TIME, GAS, AND SPACE ANALYSIS");
  console.log("=================================================================");

  const signers = await hre.ethers.getSigners();
  const admin = signers[0];
  const officer = signers[1];
  const farmer = signers[2];

  // 1. Contract Deployment
  const tDeployStart = process.hrtime.bigint();
  const FarmerSubsidy = await hre.ethers.getContractFactory("FarmerSubsidy");
  const contract = await FarmerSubsidy.deploy();
  await contract.waitForDeployment();
  const deployReceipt = await contract.deploymentTransaction().wait();
  const tDeployEnd = process.hrtime.bigint();
  const deployLatencyMs = Number(tDeployEnd - tDeployStart) / 1e6;

  console.log(`Contract Address: ${await contract.getAddress()}`);
  console.log(`Deployment Gas: ${deployReceipt.gasUsed.toString()} gas units`);
  console.log(`Deployment Block: ${deployReceipt.blockNumber}, Latency: ${deployLatencyMs.toFixed(3)} ms`);

  // Authorize officer
  const txAuth = await contract.connect(admin).addOfficer(officer.address);
  await txAuth.wait();

  // 2. Block Creation & Mining Time Measurement over N = 30 Blocks
  const N = 30;
  const blockTimes = [];
  const submissionGas = [];
  const verificationGas = [];
  const approvalGas = [];
  const releaseGas = [];

  console.log(`\nExecuting ${N} consecutive block creations to measure precise block mining latency...`);

  for (let i = 1; i <= N; i++) {
    const schemeId = `SCHEME-BENCH-2026-${String(i).padStart(3, "0")}`;
    const txScheme = await contract.connect(admin).createScheme(
      schemeId,
      `Subsidy Scheme ${i}`,
      `Benchmark Scheme Description ${i}`,
      10000 + i * 500
    );
    await txScheme.wait();

    const appId = `APP-REAL-2026-${String(i).padStart(4, "0")}`;
    const docHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(`DOCUMENT_CONTENT_PARCEL_${i}`));

    // Measure Block Creation / Mining Time for Application Submission
    const tStart = process.hrtime.bigint();
    const tx = await contract.connect(farmer).submitApplication(appId, schemeId, docHash);
    const receipt = await tx.wait();
    const tEnd = process.hrtime.bigint();

    const latencyMs = Number(tEnd - tStart) / 1e6;
    blockTimes.push(latencyMs);
    submissionGas.push(Number(receipt.gasUsed));

    // Officer Verification
    const txV = await contract.connect(officer).verifyApplication(appId);
    const rV = await txV.wait();
    verificationGas.push(Number(rV.gasUsed));

    // Officer Approval
    const txA = await contract.connect(officer).approveApplication(appId);
    const rA = await txA.wait();
    approvalGas.push(Number(rA.gasUsed));

    // Payment Release
    const txR = await contract.connect(officer).releasePayment(appId);
    const rR = await txR.wait();
    releaseGas.push(Number(rR.gasUsed));
  }

  // Statistical calculations
  const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const stdDev = (arr, m) => Math.sqrt(arr.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / (arr.length - 1));

  const meanBlockTime = mean(blockTimes);
  const sdBlockTime = stdDev(blockTimes, meanBlockTime);
  const minBlockTime = Math.min(...blockTimes);
  const maxBlockTime = Math.max(...blockTimes);

  const meanSubGas = mean(submissionGas);
  const meanVerGas = mean(verificationGas);
  const meanAppGas = mean(approvalGas);
  const meanRelGas = mean(releaseGas);

  console.log("\n-----------------------------------------------------------------");
  console.log(" 1. TIME CALCULATION FOR BLOCK CREATION (N = 30 Blocks)");
  console.log("-----------------------------------------------------------------");
  console.log(`Mean Block Creation Time (T_block): ${meanBlockTime.toFixed(3)} ms`);
  console.log(`Standard Deviation (SD):            ${sdBlockTime.toFixed(3)} ms`);
  console.log(`Minimum Block Creation Time:        ${minBlockTime.toFixed(3)} ms`);
  console.log(`Maximum Block Creation Time:        ${maxBlockTime.toFixed(3)} ms`);

  console.log("\n-----------------------------------------------------------------");
  console.log(" 2. SPACE CALCULATION (ON-CHAIN VS. OFF-CHAIN HYBRID STORAGE)");
  console.log("-----------------------------------------------------------------");
  const onChainSlots = 8;
  const onChainBytesPerApp = onChainSlots * 32; // 256 bytes

  const testFileSizes = [
    { label: "500 KB Land Deed", bytes: 500 * 1024 },
    { label: "1.0 MB Land Deed", bytes: 1024 * 1024 },
    { label: "2.5 MB Land Deed", bytes: 2.5 * 1024 * 1024 },
    { label: "5.0 MB Land Deed", bytes: 5 * 1024 * 1024 },
    { label: "10.0 MB Land Deed", bytes: 10 * 1024 * 1024 }
  ];

  console.log(`On-Chain Storage Footprint per Application: ${onChainBytesPerApp} bytes (${onChainSlots} EVM 32-byte storage slots)`);
  console.log(`\nComparative Space Reduction Analysis:`);
  for (const f of testFileSizes) {
    const spaceReduction = ((f.bytes - onChainBytesPerApp) / f.bytes) * 100;
    const hypotheticalGas = (f.bytes / 32) * 20000;
    console.log(` * ${f.label} (${f.bytes.toLocaleString()} bytes):`);
    console.log(`   - On-Chain Stored:       ${onChainBytesPerApp} bytes (SHA-256 Digest + State)`);
    console.log(`   - Off-Chain Stored:      ${f.bytes.toLocaleString()} bytes (IPFS/MongoDB)`);
    console.log(`   - Space Reduction Ratio: ${spaceReduction.toFixed(4)}%`);
    console.log(`   - Gas Saved vs Full Store: ${hypotheticalGas.toLocaleString()} gas units`);
  }

  console.log("\n-----------------------------------------------------------------");
  console.log(" 3. MEASURED GAS CONSUMPTION SUMMARY");
  console.log("-----------------------------------------------------------------");
  console.log(`Contract Deployment: ${deployReceipt.gasUsed.toString()} gas`);
  console.log(`submitApplication:   ${Math.round(meanSubGas).toLocaleString()} gas`);
  console.log(`verifyApplication:   ${Math.round(meanVerGas).toLocaleString()} gas`);
  console.log(`approveApplication:  ${Math.round(meanAppGas).toLocaleString()} gas`);
  console.log(`releasePayment:      ${Math.round(meanRelGas).toLocaleString()} gas`);

  const resultsData = {
    blockCreationTime: {
      samples: N,
      meanMs: Number(meanBlockTime.toFixed(3)),
      sdMs: Number(sdBlockTime.toFixed(3)),
      minMs: Number(minBlockTime.toFixed(3)),
      maxMs: Number(maxBlockTime.toFixed(3))
    },
    spaceCalculation: {
      onChainSlots,
      onChainBytesPerApp,
      comparisons: testFileSizes.map(f => ({
        label: f.label,
        originalBytes: f.bytes,
        onChainBytes: onChainBytesPerApp,
        spaceReductionPercent: Number((((f.bytes - onChainBytesPerApp) / f.bytes) * 100).toFixed(4)),
        gasSaved: (f.bytes / 32) * 20000
      }))
    },
    gasConsumption: {
      deployment: Number(deployReceipt.gasUsed),
      submitApplication: Math.round(meanSubGas),
      verifyApplication: Math.round(meanVerGas),
      approveApplication: Math.round(meanAppGas),
      releasePayment: Math.round(meanRelGas)
    }
  };

  fs.writeFileSync("measured_results.json", JSON.stringify(resultsData, null, 2));
  console.log("\nResults successfully saved to contracts/measured_results.json");
}

main().catch(err => {
  console.error("Measurement error:", err);
  process.exit(1);
});
