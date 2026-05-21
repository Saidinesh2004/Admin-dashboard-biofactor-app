import React from 'react';
import { motion } from 'framer-motion';
import { 
  ZoomIn, ZoomOut, RotateCcw, Download, ShieldCheck, 
  AlertTriangle, FileText, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import { useVerificationStore } from '../../store/verificationStore';
import type { OnboardingTransporter } from '../../store/onboardingStore';
import { Button } from '@/components/ui/button';

interface DocumentComparativeInspectorProps {
  carrier: OnboardingTransporter;
  onClose: () => void;
  onFieldUpdate: (field: string, value: any) => void;
}

export const DocumentComparativeInspector: React.FC<DocumentComparativeInspectorProps> = ({
  carrier,
  onClose,
  onFieldUpdate
}) => {
  const { 
    activeDocType, 
    activeDocUrl, 
    activeDocName, 
    zoomLevel, 
    setZoomLevel 
  } = useVerificationStore();

  const handleZoomIn = () => setZoomLevel(zoomLevel + 15);
  const handleZoomOut = () => setZoomLevel(zoomLevel - 15);
  const handleResetZoom = () => setZoomLevel(100);

  // Helper to determine active document fields to display
  const getDocFields = () => {
    switch (activeDocType) {
      case 'gstCert':
        return [
          { label: 'GSTIN Number', key: 'gstNumber', value: carrier.data.gstNumber },
          { label: 'Company Registered Name', key: 'companyName', value: carrier.data.companyName },
          { label: 'State Registration', key: 'state', value: carrier.data.state },
          { label: 'Registered City', key: 'city', value: carrier.data.city },
        ];
      case 'panCard':
        return [
          { label: 'PAN Card Number', key: 'panNumber', value: carrier.data.panNumber },
          { label: 'Taxpayer Name', key: 'ownerName', value: carrier.data.ownerName },
        ];
      case 'aadhaar':
        return [
          { label: 'Aadhaar UID Number', key: 'aadhaarNumber', value: carrier.data.aadhaarNumber },
          { label: 'Card Owner Name', key: 'ownerName', value: carrier.data.ownerName },
        ];
      case 'insurance':
        return [
          { label: 'Insurance Expiration Date', key: 'insuranceExpiry', value: carrier.data.insuranceExpiry },
          { label: 'Truck Fleet Count', key: 'fleetSize', value: carrier.data.fleetSize },
        ];
      case 'vehicleRc':
        return [
          { label: 'Registration Certificate Expiry', key: 'rcExpiry', value: carrier.data.rcExpiry },
          { label: 'Registered Owner Name', key: 'ownerName', value: carrier.data.ownerName },
        ];
      default:
        return [
          { label: 'Owner Name', key: 'ownerName', value: carrier.data.ownerName },
          { label: 'Company Name', key: 'companyName', value: carrier.data.companyName },
          { label: 'Mobile Number', key: 'mobile', value: carrier.data.mobile },
          { label: 'Email Address', key: 'email', value: carrier.data.email },
        ];
    }
  };

  // Helper to retrieve document audits
  const getDocAudits = () => {
    const audits = [];
    const issues = carrier.report.issues.filter(i => i.field === activeDocType || i.field === 'fraud');

    if (issues.length > 0) {
      issues.forEach(issue => {
        audits.push({
          type: 'risk',
          title: 'AI Verification Issue',
          desc: issue.message,
          icon: AlertTriangle,
          color: 'text-rose-500 bg-rose-50 border-rose-100'
        });
      });
    } else {
      audits.push({
        type: 'trust',
        title: 'Document Verified',
        desc: `AI scanned document details match database entries with ${carrier.report.confidenceScore}% confidence.`,
        icon: ShieldCheck,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
      });
    }

    // Specific OCR heuristics
    if (activeDocType === 'gstCert') {
      audits.push({
        type: 'info',
        title: 'GST Portal Authenticated',
        desc: 'Tax portal active status verified. Handshake success.',
        icon: CheckCircle2,
        color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
      });
    }

    return audits;
  };

  const docFields = getDocFields();
  const docAudits = getDocAudits();

  // Mock visual documents representing Aadhaar, PAN, GST certificate etc.
  const getMockDocumentVisual = () => {
    if (carrier.data.aadhaarUrl?.includes('fake') && (activeDocType === 'aadhaar' || activeDocType === 'panCard' || activeDocType === 'gstCert')) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-rose-950/90 text-white select-none">
          <AlertTriangle size={48} className="text-rose-500 animate-bounce mb-2" />
          <h4 className="text-base font-bold uppercase tracking-wider text-rose-400">Security Warning</h4>
          <p className="text-xs text-rose-200 text-center mt-2 max-w-[280px]">
            AI deep-scan identified forged template structure, copy-paste signatures, and low DPI digital manipulation.
          </p>
        </div>
      );
    }

    return (
      <div 
        className="w-full bg-slate-900 border border-slate-700/50 rounded-lg p-6 font-mono text-[9px] text-emerald-400 shadow-2xl relative overflow-hidden transition-all duration-300"
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
      >
        <div className="flex justify-between items-center border-b border-emerald-700/50 pb-3 mb-4">
          <div className="flex items-center gap-1.5">
            <FileText size={14} className="text-indigo-400" />
            <span className="font-bold text-slate-200 text-[10px]">{activeDocName.toUpperCase()}</span>
          </div>
          <span className="text-[8px] bg-emerald-950 border border-emerald-800 text-emerald-300 px-1 rounded">OCR BOUNDS ACTIVE</span>
        </div>

        {/* Dynamic Mock Fields Overlaid with OCR Coordinate Blocks */}
        <div className="space-y-4">
          {docFields.map((field, idx) => (
            <div key={idx} className="relative group border border-emerald-800/30 bg-emerald-950/20 p-2 rounded hover:bg-emerald-950/40 transition-colors">
              <span className="absolute -top-2 left-2 bg-slate-900 text-emerald-500 text-[6px] px-1 font-bold">BLOCK_COORD_{100 + idx}</span>
              <p className="text-slate-400 text-[8px] font-sans mt-0.5">{field.label}:</p>
              <p className="text-slate-200 text-xs font-bold font-mono tracking-wide select-all mt-0.5">{String(field.value).toUpperCase()}</p>
            </div>
          ))}
        </div>

        {/* Scan Watermark */}
        <div className="mt-8 border-t border-emerald-900/30 pt-4 flex justify-between items-center text-[7px] text-slate-500 font-sans">
          <span>BIOFACTOR LOGISTICS AI SCANNER v4.12</span>
          <span>DATE: {carrier.uploadedAt}</span>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-[550px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-50 overflow-hidden text-slate-200"
    >
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-indigo-400" />
            AI comparative Document Inspector
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Comparing {carrier.data.companyName} documents</p>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Selector Tabs */}
      <div className="flex bg-slate-950 border-b border-slate-800/80 px-2 pt-1 gap-1 overflow-x-auto">
        {(['gstCert', 'panCard', 'aadhaar', 'insurance', 'vehicleRc'] as const).map(tab => {
          const isActive = activeDocType === tab;
          const label = tab === 'gstCert' ? 'GST Cert' : tab === 'panCard' ? 'PAN Card' : tab === 'aadhaar' ? 'Aadhaar' : tab === 'insurance' ? 'Insurance' : 'Vehicle RC';
          const fieldKey = tab === 'gstCert' ? 'gstNumber' : tab === 'panCard' ? 'panNumber' : tab === 'aadhaar' ? 'aadhaarNumber' : tab === 'insurance' ? 'insuranceExpiry' : 'rcExpiry';
          
          const isVerified = carrier.data.verifiedDocuments?.includes(fieldKey);
          const isRejected = carrier.data.rejectedDocuments?.includes(fieldKey);
          const hasError = carrier.report.issues.some(i => i.field === tab || (tab === 'gstCert' && i.field === 'gstNumber') || (tab === 'panCard' && i.field === 'panNumber') || (tab === 'aadhaar' && i.field === 'aadhaarNumber'));

          return (
            <button
              key={tab}
              onClick={() => {
                const url = tab === 'gstCert' ? carrier.data.gstUrl : tab === 'panCard' ? carrier.data.panUrl : tab === 'aadhaar' ? carrier.data.aadhaarUrl : tab === 'insurance' ? carrier.data.insuranceUrl : carrier.data.rcUrl;
                const name = tab === 'gstCert' ? 'GST Registration Certificate' : tab === 'panCard' ? 'PAN Card' : tab === 'aadhaar' ? 'Aadhaar Card' : tab === 'insurance' ? 'Insurance Certificate' : 'Registration Certificate';
                useVerificationStore.getState().setDocPreview(tab, url || '', name);
              }}
              className={`px-3 py-2 text-[10px] font-bold rounded-t-md transition-all flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-slate-900 text-white border-b-2 border-indigo-500' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {label}
              {isVerified ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              ) : isRejected ? (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              ) : hasError ? (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Content Split: Top (Scanned view) & Bottom (Structured Editable panel) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        
        {/* Scanned Viewer Area */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 relative overflow-hidden h-[240px] flex flex-col">
          {/* Zoom Panel HUD */}
          <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 p-1 rounded-md flex items-center gap-1 z-10 shadow-lg">
            <button onClick={handleZoomOut} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="Zoom Out"><ZoomOut size={12} /></button>
            <span className="text-[9px] font-mono font-bold text-slate-300 w-8 text-center">{zoomLevel}%</span>
            <button onClick={handleZoomIn} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="Zoom In"><ZoomIn size={12} /></button>
            <button onClick={handleResetZoom} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="Reset Zoom"><RotateCcw size={12} /></button>
          </div>

          <div className="flex-1 overflow-auto flex justify-center items-start pt-4 custom-scrollbar">
            {getMockDocumentVisual()}
          </div>
        </div>

        {/* Structured OCR comparative fields */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3.5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={13} className="text-indigo-400" /> Smart OCR Extracted Data
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {docFields.map((field, idx) => (
              <div key={idx} className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold">{field.label}</label>
                <div className="relative">
                  <input
                    type={field.key === 'fleetSize' ? 'number' : 'text'}
                    value={field.value}
                    onChange={(e) => onFieldUpdate(field.key, field.key === 'fleetSize' ? parseInt(e.target.value) || 0 : e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono tracking-wide"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Trust Audits */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Fraud & trust Audit</h4>
          <div className="space-y-2">
            {docAudits.map((audit, idx) => {
              const Icon = audit.icon;
              return (
                <div key={idx} className={`p-3 rounded-lg border flex gap-3 ${audit.color}`}>
                  <div className="p-1.5 rounded bg-white shadow-xs self-start">
                    <Icon size={14} className="text-slate-800" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-slate-800">{audit.title}</p>
                    <p className="text-[10px] text-slate-600/90 leading-relaxed">{audit.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center gap-2">
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="text-slate-400">OCR Reliability:</span>
          <span className={`font-bold ${carrier.report.score >= 80 ? 'text-emerald-400' : carrier.report.score >= 50 ? 'text-amber-400' : 'text-rose-500'}`}>
            {carrier.report.score}% trust
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              const fieldKey = activeDocType === 'gstCert' ? 'gstNumber' : activeDocType === 'panCard' ? 'panNumber' : activeDocType === 'aadhaar' ? 'aadhaarNumber' : activeDocType === 'insurance' ? 'insuranceExpiry' : 'rcExpiry';
              const currentVerified = carrier.data.verifiedDocuments || [];
              const currentRejected = carrier.data.rejectedDocuments || [];
              onFieldUpdate('rejectedDocuments', [...currentRejected.filter(r => r !== fieldKey), fieldKey]);
              onFieldUpdate('verifiedDocuments', currentVerified.filter(v => v !== fieldKey));
            }}
            className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[10px] font-bold uppercase tracking-wider h-8"
          >
            Reject Doc
          </Button>
          <Button
            onClick={() => {
              const fieldKey = activeDocType === 'gstCert' ? 'gstNumber' : activeDocType === 'panCard' ? 'panNumber' : activeDocType === 'aadhaar' ? 'aadhaarNumber' : activeDocType === 'insurance' ? 'insuranceExpiry' : 'rcExpiry';
              const currentVerified = carrier.data.verifiedDocuments || [];
              const currentRejected = carrier.data.rejectedDocuments || [];
              onFieldUpdate('verifiedDocuments', [...currentVerified.filter(v => v !== fieldKey), fieldKey]);
              onFieldUpdate('rejectedDocuments', currentRejected.filter(r => r !== fieldKey));
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider h-8"
          >
            Verify Doc
          </Button>
          <Button
            onClick={() => {
              const link = document.createElement('a');
              link.href = '#'; // Mock download action
              link.setAttribute('download', activeDocName.replace(/\s+/g, '_') + '.jpg');
              document.body.appendChild(link);
              link.click();
              link.remove();
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-wider h-8 flex items-center gap-1.5"
          >
            <Download size={12} /> Download
          </Button>
          <Button 
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-wider h-8"
          >
            Save & Close
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
