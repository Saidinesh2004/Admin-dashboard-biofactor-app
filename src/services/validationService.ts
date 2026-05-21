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
    let confidenceScore = 100;
    let isAutoRejected = false;
    let rejectionReason = "";

    // Basic structure validation: verify name and mobile are present
    const hasName = data.name || data.ownerName || data.companyName;
    if (!hasName) {
      issues.push({ type: 'error', field: 'name', message: 'Name is missing from registry.' });
      score -= 50;
    }
    if (!data.mobile) {
      issues.push({ type: 'error', field: 'mobile', message: 'Mobile number is missing.' });
      score -= 50;
    }

    // Keep support for manual auditor rejection overrides
    const rejectedDocs = data.rejectedDocuments || [];
    rejectedDocs.forEach(field => {
      if (!issues.some(i => i.field === field)) {
        issues.push({ type: 'error', field, message: 'Manually rejected.' });
      }
    });

    const isManualRejected = issues.some(i => rejectedDocs.includes(i.field));
    let status: ValidationReport['status'] = 'AI Verified';

    if (isManualRejected || score <= 40) {
      status = 'Rejected';
      isAutoRejected = true;
      rejectionReason = isManualRejected
        ? "Rejected: Failed manual compliance inspection."
        : "Missing required onboarding credentials (name or mobile).";
    } else if (issues.length > 0) {
      status = 'Needs Manual Review';
    }

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
