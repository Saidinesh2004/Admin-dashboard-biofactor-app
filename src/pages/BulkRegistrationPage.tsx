import React, { useState, useMemo, useRef } from 'react';
import { 
  Upload, FileSpreadsheet, FileText, CheckCircle2, AlertTriangle, 
  XCircle, ArrowRight, ShieldCheck, Edit, Trash2, Check, X, 
  Plus, BarChart3, CloudLightning, RefreshCw, Download, 
  Search, ShieldAlert, History, Users, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useBulkRegistrationStore, type ExtractedTransporter } from '@/store/bulkRegistrationStore';
import { useTransporterStore } from '@/store/transporterStore';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function BulkRegistrationPage() {
  const { toast } = useToast();
  const { transporters } = useTransporterStore();
  const { 
    uploadHistory, extractedRecords, isUploading, uploadProgress, 
    mockExtractFiles, updateRecord, deleteRecord, submitBulk 
  } = useBulkRegistrationStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ExtractedTransporter>>({});

  // Dynamic KPI Card Calculations
  const stats = useMemo(() => {
    const totalImported = uploadHistory.reduce((sum, h) => sum + h.totalRecords, 0);
    const successfulImports = uploadHistory.reduce((sum, h) => sum + h.successful, 0);
    const failedImports = uploadHistory.reduce((sum, h) => sum + h.failed, 0);
    
    const pendingReview = extractedRecords.filter(r => r.validationResult !== 'Valid').length;
    const duplicateEntries = extractedRecords.filter(r => r.validationResult === 'Duplicate Entry').length;
    const activeCarriers = transporters.filter(t => t.status === 'Approved').length;

    return { totalImported, successfulImports, failedImports, pendingReview, duplicateEntries, activeCarriers };
  }, [uploadHistory, extractedRecords, transporters]);

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
      const filesArray = Array.from(e.dataTransfer.files);
      const validFiles = filesArray.filter(f => 
        f.name.endsWith('.pdf') || 
        f.name.endsWith('.doc') || 
        f.name.endsWith('.docx') || 
        f.name.endsWith('.xlsx') || 
        f.name.endsWith('.csv')
      );

      if (validFiles.length === 0) {
        toast({
          title: "Unsupported File Type",
          description: "Please upload PDF, DOC, DOCX, XLSX, or CSV spreadsheets.",
          variant: "destructive"
        });
        return;
      }

      mockExtractFiles(validFiles);
      toast({
        title: "Spreadsheet Uploaded",
        description: `Initiated smart OCR data extraction for ${validFiles[0].name}...`,
        className: "bg-blue-600 text-white font-semibold border-none"
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      mockExtractFiles(filesArray);
      toast({
        title: "Document Parsing Queued",
        description: `Importing transporter registrations from ${filesArray[0].name}...`,
        className: "bg-slate-900 text-white font-semibold border-none"
      });
    }
  };

  const startInlineEdit = (index: number, rec: ExtractedTransporter) => {
    setEditingIndex(index);
    setEditForm({
      companyName: rec.companyName,
      ownerName: rec.ownerName,
      mobile: rec.mobile,
      email: rec.email,
      gstNumber: rec.gstNumber,
      panNumber: rec.panNumber,
      fleetSize: rec.fleetSize,
      city: rec.city,
      state: rec.state
    });
  };

  const saveInlineEdit = (index: number) => {
    updateRecord(index, editForm);
    setEditingIndex(null);
    toast({
      title: "Record Updated",
      description: "Edited transporter specifications validated successfully.",
      className: "bg-green-600 text-white border-none font-semibold"
    });
  };

  const cancelInlineEdit = () => {
    setEditingIndex(null);
  };

  const handleBulkSubmit = () => {
    const hasErrors = extractedRecords.some(r => r.validationResult !== 'Valid');
    if (hasErrors) {
      toast({
        title: "Validation Review Required",
        description: "Please correct or delete records flagged with errors or duplicates.",
        variant: "destructive"
      });
      return;
    }

    if (extractedRecords.length === 0) {
      toast({
        title: "Queue Empty",
        description: "Please upload registration documents to extract carrier profiles.",
        variant: "destructive"
      });
      return;
    }

    submitBulk(() => {
      toast({
        title: "Bulk Onboarding Success!",
        description: "All extracted valid carriers registered as Approved Partners in Users database.",
        className: "bg-emerald-600 text-white border-none font-bold shadow-md animate-bounce"
      });
    });
  };

  const getValidationBadge = (result: ExtractedTransporter['validationResult']) => {
    switch (result) {
      case 'Valid': 
        return <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[10px]">Valid</Badge>;
      case 'Duplicate Entry': 
        return <Badge className="bg-rose-100 text-rose-800 border-none font-bold text-[10px]">Duplicate Entry</Badge>;
      case 'Needs Review': 
        return <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[10px]">Review Required</Badge>;
      default: 
        return <Badge variant="outline" className="text-[10px]">{result}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bulk Transporter Onboarding</h1>
          <p className="text-sm text-gray-500 mt-1">Upload transporter sheets and register enterprise carriers in bulk.</p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-slate-900 text-white">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Onboarded</p>
          <h3 className="text-2xl font-extrabold font-mono text-emerald-400">{stats.totalImported}</h3>
        </Card>
        <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-white">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Successful Imports</p>
          <h3 className="text-2xl font-extrabold font-mono text-emerald-600">{stats.successfulImports}</h3>
        </Card>
        <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-white">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Failed Imports</p>
          <h3 className="text-2xl font-extrabold font-mono text-rose-600">{stats.failedImports}</h3>
        </Card>
        <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-white">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Needs Audit Review</p>
          <h3 className="text-2xl font-extrabold font-mono text-amber-600">{stats.pendingReview}</h3>
        </Card>
        <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-white">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Duplicate Flagged</p>
          <h3 className="text-2xl font-extrabold font-mono text-red-600">{stats.duplicateEntries}</h3>
        </Card>
        <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-white">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-semibold">Approved KYC DB</p>
          <h3 className="text-2xl font-extrabold font-mono text-slate-900">{stats.activeCarriers}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Workspace: Upload Box & History */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Upload Drag Box */}
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-950 text-white p-5">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"><Layers size={14} className="text-indigo-400" /> Smart Spreadsheet Upload</CardTitle>
              <CardDescription className="text-xs text-slate-400">Supports PDF, DOC, DOCX, XLSX, and CSV registries.</CardDescription>
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
                  accept=".pdf,.doc,.docx,.xlsx,.csv" 
                  className="hidden" 
                />
                
                {isUploading ? (
                  <div className="space-y-3 w-full max-w-[200px]">
                    <RefreshCw size={24} className="animate-spin text-primary mx-auto" />
                    <p className="text-xs font-bold text-slate-700">OCR AI Parsing {uploadProgress}%</p>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-white border border-gray-100 rounded-2xl shadow-2xs text-slate-500">
                      <Upload size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Drag & Drop carrier sheets here</p>
                      <p className="text-[10px] text-slate-400 mt-1">or click to browse local files</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload History log */}
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-5">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <History size={15} className="text-indigo-500" /> Import History Log
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">Review status of previous bulk imports.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 max-h-[300px] overflow-y-auto space-y-3.5 custom-scrollbar">
              {uploadHistory.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileSpreadsheet size={13} className="text-emerald-600" />
                        {item.fileName}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono">Batch: {item.id} | Size: {item.fileSize}</p>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-mono px-1 py-0 uppercase">{item.fileType}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-t pt-2 mt-1">
                    <span className="text-slate-400">On: {item.uploadDate}</span>
                    <div className="flex gap-2 font-mono">
                      <span className="text-emerald-600 font-bold">✓ {item.successful}</span>
                      <span className="text-rose-600 font-bold">✗ {item.failed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        {/* Right Workspace: Extracted Preview Grid */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CloudLightning size={16} className="text-indigo-500 animate-pulse" />
                    OCR Extracted Registrations Queue
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Validate duplicates and missing tax credentials before database onboarding.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleBulkSubmit}
                    disabled={extractedRecords.length === 0}
                    className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold uppercase tracking-wider h-8 shadow-xs"
                  >
                    Submit Bulk Registration
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {extractedRecords.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <FileText size={40} className="text-slate-200 mx-auto" />
                  <p className="text-sm text-slate-400 italic font-medium">No registrations waiting in onboarding queue.</p>
                  <p className="text-xs text-slate-400/70">Upload a spreadsheet on the left to extract profiles.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-bold text-gray-500 uppercase text-[9px] pl-5 py-3">Carrier / Owner</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[9px]">Contact & Email</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[9px]">PAN / GSTIN</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[9px]">Fleet Size</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[9px]">Validation Result</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[9px] text-right pr-5">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extractedRecords.map((rec, index) => {
                        const isEditingThis = editingIndex === index;
                        return (
                          <TableRow key={index} className="hover:bg-slate-50/50">
                            
                            {/* Company / Owner details */}
                            <TableCell className="pl-5">
                              {isEditingThis ? (
                                <div className="space-y-2 py-1 max-w-[140px]">
                                  <Input 
                                    value={editForm.companyName}
                                    onChange={e => setEditForm(prev => ({ ...prev, companyName: e.target.value }))}
                                    placeholder="Company Name"
                                    className="bg-white h-7 text-[10px]"
                                  />
                                  <Input 
                                    value={editForm.ownerName}
                                    onChange={e => setEditForm(prev => ({ ...prev, ownerName: e.target.value }))}
                                    placeholder="Owner Name"
                                    className="bg-white h-7 text-[10px]"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-slate-800">{rec.companyName}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">Owner: {rec.ownerName}</p>
                                </div>
                              )}
                            </TableCell>

                            {/* Contact Details */}
                            <TableCell>
                              {isEditingThis ? (
                                <div className="space-y-2 py-1 max-w-[140px]">
                                  <Input 
                                    value={editForm.mobile}
                                    onChange={e => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                                    placeholder="Mobile No"
                                    className="bg-white h-7 text-[10px]"
                                  />
                                  <Input 
                                    value={editForm.email}
                                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Email Address"
                                    className="bg-white h-7 text-[10px]"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-0.5 text-xs text-slate-700">
                                  <p className="font-medium">{rec.mobile}</p>
                                  <p className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">{rec.email}</p>
                                </div>
                              )}
                            </TableCell>

                            {/* Tax Details */}
                            <TableCell>
                              {isEditingThis ? (
                                <div className="space-y-2 py-1 max-w-[130px]">
                                  <Input 
                                    value={editForm.panNumber}
                                    onChange={e => setEditForm(prev => ({ ...prev, panNumber: e.target.value }))}
                                    placeholder="PAN Card No"
                                    className="bg-white h-7 text-[10px] uppercase"
                                  />
                                  <Input 
                                    value={editForm.gstNumber}
                                    onChange={e => setEditForm(prev => ({ ...prev, gstNumber: e.target.value }))}
                                    placeholder="GST No"
                                    className="bg-white h-7 text-[10px] uppercase"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-0.5 text-[11px] font-mono text-slate-700">
                                  <p className="font-bold">GST: {rec.gstNumber || 'MISSING'}</p>
                                  <p className="text-[10px] text-slate-400">PAN: {rec.panNumber || 'MISSING'}</p>
                                </div>
                              )}
                            </TableCell>

                            {/* Fleet details */}
                            <TableCell>
                              {isEditingThis ? (
                                <Input 
                                  type="number"
                                  value={editForm.fleetSize}
                                  onChange={e => setEditForm(prev => ({ ...prev, fleetSize: parseInt(e.target.value) || 0 }))}
                                  placeholder="Fleet Size"
                                  className="bg-white h-7 text-[10px] max-w-[70px] font-mono"
                                />
                              ) : (
                                <Badge variant="outline" className="border-gray-200 text-gray-600 font-bold text-[10px]">{rec.fleetSize} Trucks</Badge>
                              )}
                            </TableCell>

                            {/* Validation Result */}
                            <TableCell>
                              <div className="space-y-1">
                                <div>{getValidationBadge(rec.validationResult)}</div>
                                {rec.errors.map((err, errIdx) => (
                                  <p key={errIdx} className="text-[9px] text-rose-600 font-semibold leading-tight max-w-[140px]">{err}</p>
                                ))}
                              </div>
                            </TableCell>

                            {/* Row Actions */}
                            <TableCell className="text-right pr-5">
                              {isEditingThis ? (
                                <div className="flex justify-end gap-1">
                                  <Button 
                                    onClick={() => saveInlineEdit(index)}
                                    size="icon" 
                                    className="bg-green-600 hover:bg-green-700 text-white h-7 w-7 rounded"
                                  >
                                    <Check size={12} />
                                  </Button>
                                  <Button 
                                    onClick={cancelInlineEdit}
                                    size="icon" 
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 h-7 w-7 rounded"
                                  >
                                    <X size={12} />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-1">
                                  <Button 
                                    onClick={() => startInlineEdit(index, rec)}
                                    size="icon" 
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 h-7 w-7 rounded"
                                  >
                                    <Edit size={12} />
                                  </Button>
                                  <Button 
                                    onClick={() => { deleteRecord(index); toast({ title: "Record Dismissed", description: "Transporter entry deleted from queue." }); }}
                                    size="icon" 
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 h-7 w-7 rounded border border-rose-100"
                                  >
                                    <Trash2 size={12} />
                                  </Button>
                                </div>
                              )}
                            </TableCell>

                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
