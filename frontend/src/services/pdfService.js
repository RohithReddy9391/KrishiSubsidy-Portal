import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

/**
 * Service to generate official PDF application receipt with embedded QR code.
 */
export const generateApplicationReceipt = async (application) => {
  if (!application || !application.applicationId) {
    throw new Error('Invalid application data for PDF receipt generation');
  }

  // 1. Build Verification URL for QR Code
  const baseUrl = window.location.origin;
  const verificationUrl = `${baseUrl}/?tab=verify&appId=${encodeURIComponent(application.applicationId)}`;

  // 2. Generate QR Code Data URL
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(verificationUrl, { width: 180, margin: 1 });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
  }

  // 3. Initialize jsPDF Document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Color Palette
  const navyColor = [10, 25, 47];       // #0a192f
  const skyBlueColor = [2, 132, 199];   // #0284c7
  const greenColor = [4, 120, 87];      // #047857
  const darkGrayColor = [71, 85, 105];  // #475569

  // Top Banner Accent Bar
  doc.setFillColor(...navyColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('MINISTRY OF AGRICULTURE & FARMERS WELFARE', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Government of India — Blockchain Farmer Subsidy Portal (Academic Prototype)', 14, 17);

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 23);

  // Document Title
  doc.setTextColor(...navyColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('OFFICIAL SUBSIDY APPLICATION RECEIPT', 14, 37);

  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 40, pageWidth - 14, 40);

  // Draw Embedded QR Code Box (Right Side)
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', pageWidth - 52, 44, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...skyBlueColor);
    doc.text('SCAN TO VERIFY ON-CHAIN', pageWidth - 52, 85);
  }

  // Key Information Grid (Left Side)
  let y = 47;
  const addLabelValue = (label, value, isHighlight = false) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...navyColor);
    doc.text(label, 14, y);

    doc.setFont('helvetica', isHighlight ? 'bold' : 'normal');
    doc.setFontSize(9);
    if (isHighlight) {
      doc.setTextColor(...greenColor);
    } else {
      doc.setTextColor(30, 41, 59);
    }
    doc.text(String(value || 'N/A'), 62, y);
    y += 6.5;
  };

  addLabelValue('Application ID:', application.applicationId);
  addLabelValue('Submission Date:', new Date(application.createdAt).toLocaleString());
  addLabelValue('Farmer Wallet:', application.farmerWallet);
  addLabelValue('Target Scheme:', application.schemeId);
  addLabelValue('Financial Aid Amount:', `INR ${application.subsidyAmount?.toLocaleString()}`, true);
  addLabelValue('Application Status:', application.status);
  addLabelValue('Payment Status:', application.paymentStatus || (application.status === 'APPROVED' ? 'APPROVED_PAYMENT_PENDING' : 'PENDING_APPROVAL'));

  y += 4;
  doc.setLineWidth(0.3);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // Cryptographic & On-Chain Integrity Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...navyColor);
  doc.text('Cryptographic Hash & Decentralized Storage Record', 14, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkGrayColor);

  doc.text('Uploaded Document File:', 14, y);
  doc.setFont('helvetica', 'bold');
  doc.text(application.documentFileName || 'Document Proof', 62, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text('SHA-256 Hash Digest:', 14, y);
  y += 4.5;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y - 3, pageWidth - 28, 7, 'F');
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(2, 132, 199);
  doc.text(application.documentHash || 'N/A', 16, y + 1.5);
  y += 9;

  if (application.ipfsCid) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...darkGrayColor);
    doc.text('IPFS CID (Decentralized Storage):', 14, y);
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(4, 120, 87);
    doc.text(application.ipfsCid, 68, y);
    y += 6;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkGrayColor);
  doc.text('On-Chain Transaction Hash:', 14, y);
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(application.txHash || 'Sealed on Smart Contract (Local Hardhat Node)', 62, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkGrayColor);
  doc.text('Verifying Officer:', 14, y);
  doc.setFont('helvetica', 'bold');
  doc.text(application.verifiedByOfficer || 'Pending Officer Sign', 62, y);
  y += 10;

  // Direct Benefit Transfer (DBT) Information Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...navyColor);
  doc.text('Direct Benefit Transfer (DBT) Payment Status', 14, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkGrayColor);
  doc.text('Bank UTR Reference:', 14, y);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(application.utrReference ? greenColor[0] : darkGrayColor[0], application.utrReference ? greenColor[1] : darkGrayColor[1], application.utrReference ? greenColor[2] : darkGrayColor[2]);
  doc.text(application.utrReference || 'Pending External DBT Release (Approved - Payment Pending)', 62, y);
  y += 6;

  if (application.paymentProcessedAt) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...darkGrayColor);
    doc.text('Disbursement Date:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(application.paymentProcessedAt).toLocaleString(), 62, y);
    y += 8;
  } else {
    y += 2;
  }

  // Verification Instructions Box
  y += 5;
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.rect(14, y, pageWidth - 28, 22, 'DF');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...skyBlueColor);
  doc.text('PUBLIC VERIFICATION INSTRUCTIONS', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(12, 74, 110);
  doc.text('1. Scan the QR Code on this receipt or visit the Public Verification Portal.', 18, y + 11);
  doc.text('2. Upload your original land document to re-calculate its SHA-256 hash.', 18, y + 15);
  doc.text('3. Compare off-chain database metadata side-by-side with on-chain smart contract records.', 18, y + 19);

  // Footer Disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Disclaimer: This official receipt is generated for the Blockchain Farmer Subsidy Distribution System academic prototype. Direct Benefit Transfer (DBT) payment references are simulated for demonstration purposes.', 14, doc.internal.pageSize.getHeight() - 10, { maxWidth: pageWidth - 28 });

  // Save PDF File
  doc.save(`Subsidy_Receipt_${application.applicationId}.pdf`);
};
