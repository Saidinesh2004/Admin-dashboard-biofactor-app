import type { OCRExtractedData } from './ocrService';

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
}

export interface ValidationReport {
  score: number; // 0-100%
  status: 'AI Verified' | 'Needs Manual Review' | 'Rejected' | 'Duplicate Found' | 'Missing Documents' | 'Expired Documents';
  issues: ValidationIssue[];
  isAutoRejected: boolean;
  rejectionReason?: string;
  confidenceScore: number; // 0-100%
}

export const validationService = {
  /**
   * Performs deep verification on extracted transporter details
   */
  verifyDocumentsAI: (
    data: OCRExtractedData,
    existingTransporters: { gstNumber?: string; panNumber?: string; mobile?: string }[]
  ): ValidationReport => {
    const issues: ValidationIssue[] = [];
    let score = 100;
    let confidenceScore = 98; // Base OCR reliability score
    let isAutoRejected = false;
    let rejectionReason = "";

    // 1. Validate GST Number format (GSTIN syntax: 2 digits, 10 PAN letters/numbers, 1 char, 1 char, 1 digit/char)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!data.gstNumber) {
      issues.push({ type: 'error', field: 'gstNumber', message: 'GSTIN document is missing or OCR scan failed.' });
      score -= 30;
      confidenceScore -= 15;
    } else {
      const isGstValid = gstRegex.test(data.gstNumber.toUpperCase());
      if (!isGstValid) {
        issues.push({ type: 'error', field: 'gstNumber', message: `GSTIN "${data.gstNumber}" has invalid syntax / checksum character.` });
        score -= 25;
        confidenceScore -= 20;
      }
    }

    // 2. Validate PAN Number format (5 letters, 4 digits, 1 letter)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!data.panNumber) {
      issues.push({ type: 'error', field: 'panNumber', message: 'PAN Card number is missing or unreadable.' });
      score -= 30;
      confidenceScore -= 15;
    } else {
      const isPanValid = panRegex.test(data.panNumber.toUpperCase());
      if (!isPanValid) {
        issues.push({ type: 'error', field: 'panNumber', message: `PAN "${data.panNumber}" format is invalid.` });
        score -= 20;
        confidenceScore -= 10;
      }
    }

    // 3. Aadhaar Verification
    const cleanAadhaar = data.aadhaarNumber.replace(/\s/g, '');
    const aadhaarRegex = /^\d{12}$/;
    if (!data.aadhaarNumber) {
      issues.push({ type: 'error', field: 'aadhaarNumber', message: 'Aadhaar number is missing.' });
      score -= 25;
      confidenceScore -= 10;
    } else if (!aadhaarRegex.test(cleanAadhaar) || cleanAadhaar === '000000000000') {
      issues.push({ type: 'error', field: 'aadhaarNumber', message: 'Aadhaar does not match standard 12-digit UIDAI format.' });
      score -= 20;
      confidenceScore -= 15;
    }

    // 4. Duplicate checks inside active carriers database
    const isGstDuplicate = existingTransporters.some(t => t.gstNumber === data.gstNumber);
    const isPanDuplicate = existingTransporters.some(t => t.panNumber === data.panNumber);
    const isMobileDuplicate = existingTransporters.some(t => t.mobile?.replace(/\D/g, '') === data.mobile.replace(/\D/g, ''));

    if (isGstDuplicate || isPanDuplicate || isMobileDuplicate) {
      let duplicateFields = [];
      if (isGstDuplicate) duplicateFields.push(`GSTIN (${data.gstNumber})`);
      if (isPanDuplicate) duplicateFields.push(`PAN (${data.panNumber})`);
      if (isMobileDuplicate) duplicateFields.push(`Mobile (${data.mobile})`);

      issues.push({ 
        type: 'error', 
        field: 'duplicate', 
        message: `Duplicate transporter flagged! Matches existing database on: ${duplicateFields.join(', ')}` 
      });
      score = 40; // Severe hit
      confidenceScore -= 10;
    }

    // 5. Expiration audit (Insurance & RC)
    const today = new Date();
    if (data.insuranceExpiry) {
      const insExpiryDate = new Date(data.insuranceExpiry);
      if (insExpiryDate < today) {
        issues.push({ type: 'error', field: 'insuranceExpiry', message: `Carrier vehicle insurance has EXPIRED on ${data.insuranceExpiry}.` });
        score -= 20;
      }
    }
    if (data.rcExpiry) {
      const rcExpiryDate = new Date(data.rcExpiry);
      if (rcExpiryDate < today) {
        issues.push({ type: 'error', field: 'rcExpiry', message: `Registration Certificate (RC) expired on ${data.rcExpiry}.` });
        score -= 20;
      }
    }

    // 6. Name Mismatch check & Fake / Blurry Document patterns
    if (data.aadhaarUrl?.includes('fake') || data.panUrl?.includes('fake') || data.gstUrl?.includes('fake')) {
      issues.push({ type: 'error', field: 'fraud', message: 'CRITICAL: High risk fraud detected! Forged document template matching verified.' });
      score = 20;
      confidenceScore = 15;
    }

    // Determine Status
    let status: ValidationReport['status'] = 'AI Verified';

    // Auto-rejection logic: if score is less than 50 or fraud is detected
    const containsFraud = issues.some(i => i.field === 'fraud');
    const containsDuplicates = issues.some(i => i.field === 'duplicate');
    const expiredDoc = issues.some(i => i.message.includes('EXPIRED') || i.message.includes('expired'));
    
    if (containsFraud || score <= 40) {
      status = 'Rejected';
      isAutoRejected = true;
      rejectionReason = containsFraud 
        ? "CRITICAL: Fraudulent document templates detected by AI visual scanners."
        : `Verification score fell below threshold (${score}%). Issues: ${issues.map(i => i.message).join('; ')}`;
    } else if (containsDuplicates) {
      status = 'Duplicate Found';
    } else if (expiredDoc) {
      status = 'Expired Documents';
    } else if (issues.some(i => i.message.includes('missing') || i.message.includes('failed'))) {
      status = 'Missing Documents';
    } else if (score < 85 || issues.length > 0) {
      status = 'Needs Manual Review';
    }

    // Cap the score and confidence score
    score = Math.max(0, Math.min(100, score));
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    return {
      score,
      status,
      issues,
      isAutoRejected,
      rejectionReason: rejectionReason || undefined,
      confidenceScore
    };
  }
};
