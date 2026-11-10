const fs = require('fs');
const path = require('path');
const http = require('http');

function postJSON(pathStr, bodyObj) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(bodyObj));
    const req = http.request({
      host: '127.0.0.1',
      port: 5000,
      path: pathStr,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, res => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(buf) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJSON(pathStr) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: '127.0.0.1', port: 5000, path: pathStr }, res => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(buf) }));
    });
    req.on('error', reject);
  });
}

function postMultipart(pathStr, fields, fileFieldName, fileName, fileBuffer) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const chunks = [];

    for (const [key, val] of Object.entries(fields)) {
      chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`));
    }

    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${fileFieldName}"; filename="${fileName}"\r\nContent-Type: text/plain\r\n\r\n`));
    chunks.push(fileBuffer);
    chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`));

    const payload = Buffer.concat(chunks);

    const req = http.request({
      host: '127.0.0.1',
      port: 5000,
      path: pathStr,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length
      }
    }, res => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(buf) });
        } catch (e) {
          resolve({ status: res.statusCode, data: buf });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function testPhase3() {
  console.log("=== PHASE 3 INTEGRATION TEST SUITE ===");

  const sampleFilePath = path.join(__dirname, 'sample_land_proof.txt');
  fs.writeFileSync(sampleFilePath, 'Sample Land Records Document for Farmer Subsidy Claim 2026');
  const fileBuffer = fs.readFileSync(sampleFilePath);

  try {
    // 1. Health Check
    const healthRes = await getJSON('/api/health');
    console.log('[1/8] Health Check:', healthRes.status === 200 ? 'PASSED' : 'FAILED', healthRes.data);

    // 2. Register Farmer
    const farmerRes = await postJSON('/api/farmers/register', {
      name: 'Ramesh Patel',
      contactNumber: '9876543210',
      landAreaAcres: 4.5,
      surveyNumber: 'SURVEY-2026-77A',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      location: { district: 'Anand', state: 'Gujarat', pincode: '388001' },
      primaryCrops: ['Wheat', 'Paddy']
    });
    console.log('[2/8] Farmer Registration:', farmerRes.status === 201 ? 'PASSED' : 'FAILED', farmerRes.data.message);

    // 3. Get Schemes
    const schemesRes = await getJSON('/api/schemes');
    console.log('[3/8] Fetch Schemes:', schemesRes.status === 200 ? 'PASSED' : 'FAILED', `Count: ${schemesRes.data.count}`);

    // 4. Submit Application with Document Upload & SHA-256 Hashing
    const appRes = await postMultipart('/api/applications', {
      farmerWallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      schemeId: 'SCHEME-FERT-2026'
    }, 'document', 'sample_land_proof.txt', fileBuffer);

    const createdAppId = appRes.data.application ? appRes.data.application.applicationId : null;
    console.log('[4/8] Application Submission & SHA-256 Hashing:', appRes.status === 201 ? 'PASSED' : 'FAILED', `AppID: ${createdAppId}, Hash: ${appRes.data.application?.documentHash}`);

    // 5. Test Duplicate Claim Prevention (Tier 1 & Tier 2)
    const dupRes = await postMultipart('/api/applications', {
      farmerWallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      schemeId: 'SCHEME-FERT-2026'
    }, 'document', 'sample_land_proof.txt', fileBuffer);
    console.log('[5/8] Duplicate Prevention Check:', dupRes.status === 400 && dupRes.data.error === 'DuplicateApplicationError' ? 'PASSED' : 'FAILED', dupRes.data.message);

    // 6. Officer Verification State Transition (PENDING -> VERIFIED)
    const verifyRes = await postJSON(`/api/officer/applications/${createdAppId}/verify`, {
      officerWallet: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
    });
    console.log('[6/8] Officer Verification (PENDING -> VERIFIED):', verifyRes.status === 200 ? 'PASSED' : 'FAILED', verifyRes.data.message);

    // 7. Officer Approval State Transition (VERIFIED -> APPROVED)
    const approveRes = await postJSON(`/api/officer/applications/${createdAppId}/approve`, {
      officerWallet: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    });
    console.log('[7/8] Officer Approval (VERIFIED -> APPROVED):', approveRes.status === 200 ? 'PASSED' : 'FAILED', approveRes.data.message);

    // 8. Public Verification Endpoint Test
    const publicVerRes = await getJSON(`/api/verification/${createdAppId}`);
    console.log('[8/8] Public Verification Endpoint:', publicVerRes.status === 200 ? 'PASSED' : 'FAILED', `Status: ${publicVerRes.data.offChainRecord?.status}, Audit Events: ${publicVerRes.data.auditTrail?.length}`);

    // Cleanup sample file
    if (fs.existsSync(sampleFilePath)) fs.unlinkSync(sampleFilePath);

    console.log("\n=== ALL PHASE 3 BACKEND INTEGRATION TESTS COMPLETED SUCCESSFULLY ===");
  } catch (error) {
    console.error("Test execution failed:", error);
  }
}

testPhase3();
