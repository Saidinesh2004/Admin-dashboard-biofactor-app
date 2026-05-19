import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileSpreadsheet, FileText, CheckCircle2, AlertTriangle, 
  XCircle, ArrowRight, ShieldCheck, Edit, Trash2, Check, X, 
  Plus, BarChart3, CloudLightning, RefreshCw, Download, 
  Search, ShieldAlert, History, Users, Layers, Eye, RefreshCcw
} from 'lucide-react';

import { useOnboardingStore } from '../store/onboardingStore';
import type { OnboardingTransporter } from '../store/onboardingStore';
import { useVerificationStore } from '../store/verificationStore';
import { ocrService } from '../services/ocrService';
import { AIScanningHUD } from '../components/aiVerification/AIScanningHUD';
import { DocumentComparativeInspector } from '../components/documentPreview/DocumentComparativeInspector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function BulkTransporterOnboarding() {
  const { toast } = useToast();
  
  // Onboarding Store
  const { 
    onboardingQueue, 
    uploadHistory, 
    activeFilter,
    setActiveFilter,
    addOnboardingBatch,
    updateQueueRecord,
    deleteQueueRecord,
    approveQueueRecord,
    rejectQueueRecord,
    submitAllVerified
  } = useOnboardingStore();

  // Verification Scan Store
  const { isScanning, setScanning } = useVerificationStore();

  // Component State
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectorRecordId, setInspectorRecordId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Rejection dialog state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Active Inspector carrier
  const activeInspectorCarrier = useMemo(() => {
    return onboardingQueue.find(item => item.id === inspectorRecordId) || null;
  }, [inspectorRecordId, onboardingQueue]);

  // Dynamic KPI Card Calculations
  const stats = useMemo(() => {
    const totalQueue = onboardingQueue.length;
    const aiVerified = onboardingQueue.filter(item => item.report.status === 'AI Verified').length;
    const needsReview = onboardingQueue.filter(item => item.report.status === 'Needs Manual Review').length;
    const rejected = onboardingQueue.filter(item => item.report.status === 'Rejected').length;
    const duplicate = onboardingQueue.filter(item => item.report.status === 'Duplicate Found').length;
    const expired = onboardingQueue.filter(item => item.report.status === 'Expired Documents').length;

    return { totalQueue, aiVerified, needsReview, rejected, duplicate, expired };
  }, [onboardingQueue]);

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const valid = ['.pdf', '.doc', '.docx', '.xlsx', '.csv', '.jpg', '.jpeg', '.png'].some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );

      if (!valid) {
        toast({
          title: "Unsupported File Format",
          description: "Please upload PDF, Word docs, Excel sheets, or image archives.",
          variant: "destructive"
        });
        return;
      }

      triggerScanner(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      triggerScanner(e.target.files[0]);
    }
  };

  const triggerScanner = (file: File) => {
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${(file.size / 1024).toFixed(0)} KB`;
    
    setSelectedFile({ name: file.name, size: sizeStr });
    setScanning(true);
    toast({
      title: "File Upload Complete",
      description: "Triggering high-precision AI/OCR scan...",
      className: "bg-slate-900 text-white border-none font-semibold"
    });
  };

  const handleScanComplete = async () => {
    if (!selectedFile) return;

    try {
      // Fetch extracted mock details
      const extracted = await ocrService.extractTransporterData(selectedFile.name, selectedFile.size);
      
      // Inject to Onboarding Store queue (also triggers AI verification automatically inside)
      addOnboardingBatch(selectedFile.name, selectedFile.size, extracted);
      
      toast({
        title: "AI Analysis Complete",
        description: `Successfully analyzed registration batch from ${selectedFile.name}.`,
        className: "bg-green-600 text-white border-none font-semibold shadow-lg"
      });
    } catch (err) {
      toast({
        title: "Scan Extraction Failed",
        description: "An error occurred during OCR text extraction.",
        variant: "destructive"
      });
    } finally {
      setSelectedFile(null);
    }
  };

  // Filters extracted queue rows based on active filter tabs & Search Queries
  const filteredQueue = useMemo(() => {
    return onboardingQueue.filter(item => {
      // 1. Search filter
      const searchMatch = 
        item.data.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.data.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.data.gstNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.data.panNumber.toLowerCase().includes(searchQuery.toLowerCase());

      if (!searchMatch) return false;

      // 2. Tab Filter
      switch (activeFilter) {
        case 'AI_VERIFIED':
          return item.report.status === 'AI Verified';
        case 'NEEDS_REVIEW':
          return item.report.status === 'Needs Manual Review';
        case 'REJECTED':
          return item.report.status === 'Rejected';
        case 'DUPLICATES':
          return item.report.status === 'Duplicate Found';
        default:
          return true;
      }
    });
  }, [onboardingQueue, activeFilter, searchQuery]);

  // Quick manual Approval handler
  const handleApproveRecord = (id: string, carrierName: string) => {
    approveQueueRecord(id);
    toast({
      title: "Carrier Approved!",
      description: `${carrierName} registered as Approved Partner in Users console.`,
      className: "bg-emerald-600 text-white font-bold border-none"
    });
  };

  // Rejection Submission handler
  const submitRejection = () => {
    if (!rejectingId) return;
    rejectQueueRecord(rejectingId, rejectionReasonInput || 'Mismatched tax details and low verification trust score.');
    setRejectingId(null);
    setRejectionReasonInput('');
    toast({
      title: "Transporter Rejected",
      description: "Carrier record moved to Rejected Queue.",
      variant: "destructive"
    });
  };

  const handleBulkApprove = () => {
    const approvedCount = submitAllVerified();
    if (approvedCount > 0) {
      toast({
        title: "Bulk Onboard Complete",
        description: `Successfully registered ${approvedCount} AI Verified partners to the live database!`,
        className: "bg-emerald-600 text-white font-bold border-none"
      });
    } else {
      toast({
        title: "No Approved Records",
        description: "There are no ready 'AI Verified' transporters in the current queue.",
        variant: "destructive"
      });
    }
  };

  // Helper HSL badges mapping queue statuses
  const getStatusBadge = (status: OnboardingTransporter['report']['status']) => {
    switch (status) {
      case 'AI Verified':
        return <Badge className="bg-emerald-100/80 text-emerald-800 border border-emerald-200/50 font-bold text-[10px] px-2 py-0.5 rounded-full">AI Verified</Badge>;
      case 'Needs Manual Review':
        return <Badge className="bg-amber-100/80 text-amber-800 border border-amber-200/50 font-bold text-[10px] px-2 py-0.5 rounded-full">Needs Review</Badge>;
      case 'Rejected':
        return <Badge className="bg-rose-100/80 text-rose-800 border border-rose-200/50 font-bold text-[10px] px-2 py-0.5 rounded-full">Rejected</Badge>;
      case 'Duplicate Found':
        return <Badge className="bg-purple-100/80 text-purple-800 border border-purple-200/50 font-bold text-[10px] px-2 py-0.5 rounded-full">Duplicate Found</Badge>;
      case 'Expired Documents':
        return <Badge className="bg-red-100/80 text-red-800 border border-red-200/50 font-bold text-[10px] px-2 py-0.5 rounded-full">Expired Documents</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" />
            AI Transporter Verification Console
          </h1>
          <p className="text-sm text-gray-500 mt-1">Smart onboarding registry powered by visual OCR, tax portals integrations, and forgery check engines.</p>
        </div>
      </div>

      {/* Top KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute right-2 bottom-2 text-slate-800 pointer-events-none"><CloudLightning size={48} /></div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Total Extracted</p>
          <h3 className="text-2xl font-extrabold font-mono text-emerald-400 relative z-10">{stats.totalQueue}</h3>
        </Card>
        <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-white border-l-4 border-emerald-500">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AI Verified</p>
          <h3 className="text-2xl font-extrabold font-mono text-emerald-600">{stats.aiVerified}</h3>
        </Card>
        <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-white border-l-4 border-amber-500">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Needs Review</p>
          <h3 className="text-2xl font-extrabold font-mono text-amber-600">{stats.needsReview}</h3>
        </Card>
        <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-white border-l-4 border-rose-500">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Auto Rejected</p>
          <h3 className="text-2xl font-extrabold font-mono text-rose-600">{stats.rejected}</h3>
        </Card>
        <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-white border-l-4 border-purple-500">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Duplicate Flagged</p>
          <h3 className="text-2xl font-extrabold font-mono text-purple-600">{stats.duplicate}</h3>
        </Card>
        <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-white border-l-4 border-red-500">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expired Document</p>
          <h3 className="text-2xl font-extrabold font-mono text-red-600">{stats.expired}</h3>
        </Card>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Upload & History logs */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Dropzone Box */}
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-950 text-white p-5">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-400 animate-pulse" /> Document Dropzone
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">PDF registries, Excel, CSV, or zip files of Aadhaar/PAN photo cards.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 ${
                  isDragOver ? 'border-primary bg-indigo-50/50' : 'border-gray-200 hover:border-gray-400 bg-slate-50/20'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xlsx,.csv,.jpg,.jpeg,.png" 
                  className="hidden" 
                />
                
                <div className="p-3.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl shadow-sm">
                  <Upload size={24} className="text-indigo-500 animate-bounce" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Drag & Drop transporter records here</p>
                  <p className="text-[10px] text-slate-400 mt-1">Supports PDF, spreadsheet sheets, or JPG docs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload History list */}
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-5">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <History size={15} className="text-indigo-500" /> AI verification Logs
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">Previous parsed registries and their verification yields.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 max-h-[340px] overflow-y-auto space-y-3.5 custom-scrollbar">
              {uploadHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No logs available.</p>
              ) : (
                uploadHistory.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate max-w-[170px]">
                          <FileSpreadsheet size={13} className="text-indigo-600" />
                          {item.fileName}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono">ID: {item.id} | Size: {item.fileSize}</p>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-mono px-1 py-0 uppercase">Extracted</Badge>
                    </div>
                    <div className="flex justify-between items-center text-[10px] border-t border-slate-200/50 pt-2 mt-1">
                      <span className="text-slate-400">{item.uploadDate}</span>
                      <div className="flex gap-2 font-mono">
                        <span className="text-emerald-600 font-bold" title="AI Verified">✓ {item.verified}</span>
                        <span className="text-rose-600 font-bold" title="Rejected">✗ {item.rejected}</span>
                        <span className="text-amber-500 font-bold" title="Pending Review">? {item.pendingReview}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Side: Onboarding Grid List */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            
            {/* Table Header Controls */}
            <CardHeader className="border-b border-slate-100 p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CloudLightning size={16} className="text-indigo-500 animate-pulse" />
                    OCR Extracted Onboarding Queue
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Review, compare documents visual layers, correct scanning errors, and authorize carriers.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleBulkApprove}
                    disabled={onboardingQueue.filter(item => item.report.status === 'AI Verified').length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider h-8 shadow-xs"
                  >
                    Onboard All Verified
                  </Button>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 gap-3">
                
                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Company, Owner, Tax ID..."
                    className="pl-9 h-8 bg-slate-50 border-slate-200 text-xs w-full focus:bg-white"
                  />
                </div>

                {/* Queue Filter Tabs */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 gap-0.5 overflow-x-auto self-start md:self-auto">
                  {[
                    { id: 'ALL', label: 'All Queue' },
                    { id: 'AI_VERIFIED', label: 'AI Verified' },
                    { id: 'NEEDS_REVIEW', label: 'Needs Review' },
                    { id: 'REJECTED', label: 'Rejected' },
                    { id: 'DUPLICATES', label: 'Duplicates' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id as any)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md whitespace-nowrap transition-all ${
                        activeFilter === tab.id 
                          ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50' 
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

              </div>
            </CardHeader>
            
            {/* Table Queue */}
            <CardContent className="p-0">
              {filteredQueue.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <FileText size={40} className="text-slate-200 mx-auto" />
                  <p className="text-sm text-slate-400 italic font-medium">No registrations waiting matching selected filters.</p>
                  <p className="text-xs text-slate-400/70">Drag & drop files on the left to extract and scan profiles.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-bold text-gray-500 uppercase text-[9px] pl-5 py-3">Transporter / Owner</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[9px]">Tax Registry details</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[9px]">Score & Trust</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[9px]">Audit Status</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[9px] text-right pr-5">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence initial={false}>
                        {filteredQueue.map((item) => {
                          const isRejected = item.report.status === 'Rejected';
                          const isDuplicate = item.report.status === 'Duplicate Found';

                          return (
                            <motion.tr 
                              key={item.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -50 }}
                              className="hover:bg-slate-50/50 transition-all border-b"
                            >
                              
                              {/* Company / Owner Name */}
                              <TableCell className="pl-5 py-3.5">
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-slate-800">{item.data.companyName}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">Owner: {item.data.ownerName}</p>
                                  <p className="text-[9px] text-slate-400 font-mono">File: {item.sourceFile}</p>
                                </div>
                              </TableCell>

                              {/* Tax IDs */}
                              <TableCell>
                                <div className="space-y-0.5 font-mono text-[10px]">
                                  <p className="text-slate-700">GST: <span className="font-bold">{item.data.gstNumber || 'MISSING'}</span></p>
                                  <p className="text-slate-400">PAN: {item.data.panNumber || 'MISSING'}</p>
                                  <p className="text-slate-400">Fleet: {item.data.fleetSize} Trucks</p>
                                </div>
                              </TableCell>

                              {/* Trust Indicator / Score */}
                              <TableCell>
                                <div className="space-y-1.5 max-w-[120px]">
                                  <div className="flex justify-between items-center text-[9px] font-mono">
                                    <span className="text-slate-400">Audit Trust:</span>
                                    <span className={`font-bold ${item.report.score >= 80 ? 'text-emerald-600' : item.report.score >= 50 ? 'text-amber-500' : 'text-rose-600'}`}>
                                      {item.report.score}%
                                    </span>
                                  </div>
                                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200/30">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        item.report.score >= 80 ? 'bg-emerald-500' : item.report.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                      }`}
                                      style={{ width: `${item.report.score}%` }}
                                    />
                                  </div>
                                </div>
                              </TableCell>

                              {/* Status Badge & Issues */}
                              <TableCell>
                                <div className="space-y-1">
                                  <div>{getStatusBadge(item.report.status)}</div>
                                  
                                  {/* Error/Warning indicators */}
                                  {item.report.issues.length > 0 && (
                                    <div className="space-y-0.5">
                                      {item.report.issues.slice(0, 1).map((issue, idx) => (
                                        <p key={idx} className="text-[9px] text-rose-600 font-semibold leading-tight max-w-[150px] truncate" title={issue.message}>
                                          ⚠️ {issue.message}
                                        </p>
                                      ))}
                                      {item.report.issues.length > 1 && (
                                        <p className="text-[8px] text-indigo-500 font-bold">+{item.report.issues.length - 1} more audits warnings</p>
                                      )}
                                    </div>
                                  )}

                                  {isRejected && item.report.rejectionReason && (
                                    <p className="text-[8px] bg-rose-50 border border-rose-100 text-rose-700 px-1.5 py-0.5 rounded max-w-[150px] leading-tight font-medium">
                                      Reason: {item.report.rejectionReason}
                                    </p>
                                  )}
                                </div>
                              </TableCell>

                              {/* Grid Row Actions */}
                              <TableCell className="text-right pr-5">
                                <div className="flex justify-end gap-1.5">
                                  {/* View Comparative Inspector (Eye) */}
                                  <Button 
                                    onClick={() => setInspectorRecordId(item.id)}
                                    size="icon" 
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 h-7 w-7 rounded border border-slate-200/50 shadow-2xs"
                                    title="Open Visual OCR Comparative Inspector"
                                  >
                                    <Eye size={12} />
                                  </Button>

                                  {/* Request Re-upload (Refresh) */}
                                  <Button 
                                    onClick={() => toast({ title: "Re-upload Triggered", description: `Dispatched document asset re-upload request SMS to ${item.data.ownerName}.` })}
                                    size="icon" 
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 h-7 w-7 rounded border border-slate-200/50 shadow-2xs"
                                    title="Request High-Res Documents Re-upload"
                                  >
                                    <RefreshCcw size={12} />
                                  </Button>

                                  {/* Quick Approve (Check) */}
                                  <Button 
                                    onClick={() => handleApproveRecord(item.id, item.data.companyName)}
                                    disabled={isRejected || isDuplicate}
                                    size="icon" 
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 h-7 w-7 rounded border border-emerald-100 shadow-2xs"
                                    title="Approve & Authorize Carrier Partner"
                                  >
                                    <Check size={12} />
                                  </Button>

                                  {/* Manual Reject Dialogue Trigger (X) */}
                                  <Button 
                                    onClick={() => {
                                      if (isRejected) {
                                        deleteQueueRecord(item.id);
                                        toast({ title: "Record Deleted", description: "Transporter entry deleted from queue." });
                                      } else {
                                        setRejectingId(item.id);
                                      }
                                    }}
                                    size="icon" 
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 h-7 w-7 rounded border border-rose-100 shadow-2xs"
                                    title={isRejected ? "Delete Record Permanently" : "Manual Reject and File Incident"}
                                  >
                                    <X size={12} />
                                  </Button>
                                </div>
                              </TableCell>

                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Manual Rejection Input Dialog */}
      <Dialog open={rejectingId !== null} onOpenChange={(open) => !open && setRejectingId(null)}>
        <DialogContent className="max-w-md bg-slate-900 border border-slate-800 text-white rounded-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-bold text-rose-500 flex items-center gap-1.5">
              <ShieldAlert size={18} /> Incident Report / Auto Rejection
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Briefly describe why this carrier's tax credentials or visual visual templates failed AI audit logs.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <textarea
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g., PAN card name mismatch, blurred RTO vehicle fitness stamp unreadable, duplicate GSTIN match."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-sans min-h-[80px]"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button 
              onClick={() => setRejectingId(null)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-wider h-8"
            >
              Cancel
            </Button>
            <Button 
              onClick={submitRejection}
              className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-wider h-8"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Live scanning overlay progress screen */}
      <AIScanningHUD 
        fileName={selectedFile?.name || ''} 
        fileSize={selectedFile?.size || ''} 
        onScanComplete={handleScanComplete} 
      />

      {/* Slider Visual Comparative inspector from the right */}
      <AnimatePresence>
        {activeInspectorCarrier && (
          <DocumentComparativeInspector
            carrier={activeInspectorCarrier}
            onClose={() => setInspectorRecordId(null)}
            onFieldUpdate={(field, value) => {
              if (inspectorRecordId) {
                updateQueueRecord(inspectorRecordId, { [field]: value });
              }
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
