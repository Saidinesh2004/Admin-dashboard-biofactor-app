import React, { useState, useMemo } from 'react';
import { 
  UserCheck, Search, Filter, MoreHorizontal, CheckCircle2, 
  XCircle, AlertCircle, Clock, ShieldCheck, Eye, Truck, MapPin, 
  Calendar, Weight, CircleDollarSign, ArrowRight, Bell, User,
  Mail, Phone, FileText, Download, ShieldAlert, X, Edit2, Check,
  Maximize2, Minimize2, ZoomIn, ZoomOut, AlertTriangle, Building,
  Activity, ShieldAlert as ShieldIcon, RefreshCw, Cpu
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useTransporterStore, type TransporterProfile, type DocumentStatus } from '@/store/transporterStore';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Transporters() {
  const { toast } = useToast();
  const { transporters, notifications, updateTransporter, verifyDocument, blacklistTransporter } = useTransporterStore();
  
  // Search filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Drawer & Modal States
  const [selectedProfile, setSelectedProfile] = useState<TransporterProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [blacklistingTarget, setBlacklistingTarget] = useState<TransporterProfile | null>(null);
  
  // Document Viewer States
  const [previewDocKey, setPreviewDocKey] = useState<keyof TransporterProfile['documents'] | null>(null);
  const [previewRemarks, setPreviewRemarks] = useState('');
  const [zoomScale, setZoomScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Editable Profile Form Fields
  const [editForm, setEditForm] = useState<Partial<TransporterProfile>>({});

  // Dynamic KPI Card Calculations
  const stats = useMemo(() => {
    const total = transporters.length;
    const pending = transporters.filter(t => t.status === 'Pending').length;
    const approved = transporters.filter(t => t.status === 'Approved').length;
    const blacklisted = transporters.filter(t => t.status === 'Blacklisted').length;
    
    // Count profiles with at least one expired document
    const expiredDocs = transporters.filter(t => 
      Object.values(t.documents).some(d => d.status === 'Expired')
    ).length;

    // Sum fleet size of verified transporters
    const activeFleet = transporters
      .filter(t => t.status === 'Approved')
      .reduce((sum, t) => sum + t.fleetSize, 0);

    return { total, pending, approved, blacklisted, expiredDocs, activeFleet };
  }, [transporters]);

  // Real-time Duplicate Detection Scanner
  const duplicateAlerts = useMemo(() => {
    const alerts: { id: string; companyName: string; type: 'PAN' | 'GSTIN' | 'Mobile'; value: string; transporter: TransporterProfile }[] = [];
    const pans = new Map<string, TransporterProfile[]>();
    const gsts = new Map<string, TransporterProfile[]>();
    const mobiles = new Map<string, TransporterProfile[]>();

    transporters.forEach(t => {
      if (t.panNumber) {
        const list = pans.get(t.panNumber) || [];
        list.push(t);
        pans.set(t.panNumber, list);
      }
      if (t.gstNumber) {
        const list = gsts.get(t.gstNumber) || [];
        list.push(t);
        gsts.set(t.gstNumber, list);
      }
      if (t.mobile) {
        const cleanMobile = t.mobile.replace(/\s+/g, '');
        const list = mobiles.get(cleanMobile) || [];
        list.push(t);
        mobiles.set(cleanMobile, list);
      }
    });

    pans.forEach((list, key) => {
      if (list.length > 1) {
        list.forEach(t => {
          alerts.push({ id: `dup-pan-${t.id}`, companyName: t.companyName, type: 'PAN', value: key, transporter: t });
        });
      }
    });

    gsts.forEach((list, key) => {
      if (list.length > 1) {
        list.forEach(t => {
          alerts.push({ id: `dup-gst-${t.id}`, companyName: t.companyName, type: 'GSTIN', value: key, transporter: t });
        });
      }
    });

    mobiles.forEach((list, key) => {
      if (list.length > 1) {
        list.forEach(t => {
          alerts.push({ id: `dup-mob-${t.id}`, companyName: t.companyName, type: 'Mobile', value: key, transporter: t });
        });
      }
    });

    return alerts;
  }, [transporters]);

  // Real-time Expired Documents alerts
  const expiredAlerts = useMemo(() => {
    const alerts: { id: string; companyName: string; docKey: string; docName: string; transporter: TransporterProfile }[] = [];
    transporters.forEach(t => {
      Object.entries(t.documents).forEach(([key, doc]) => {
        if (doc.status === 'Expired') {
          alerts.push({
            id: `exp-${t.id}-${key}`,
            companyName: t.companyName,
            docKey: key,
            docName: key.replace(/([A-Z])/g, ' $1'),
            transporter: t
          });
        }
      });
    });
    return alerts;
  }, [transporters]);

  // Left Section Queue: Pending reviews
  const pendingReviews = useMemo(() => {
    return transporters.filter(t => t.status === 'Pending' || t.status === 'Under Review');
  }, [transporters]);

  // Left Section Queue: AI Risk & Compliance Score list
  const aiRiskQueue = useMemo(() => {
    return transporters.map(t => {
      const docValues = Object.values(t.documents);
      const verifiedDocs = docValues.filter(d => d.status === 'Verified').length;
      const score = Math.round((verifiedDocs / docValues.length) * 100);
      
      let riskLevel: 'Safe' | 'Needs Review' | 'Critical' = 'Safe';
      if (t.status === 'Blacklisted') riskLevel = 'Critical';
      else if (score < 50) riskLevel = 'Critical';
      else if (score < 80) riskLevel = 'Needs Review';

      return {
        transporter: t,
        score,
        riskLevel
      };
    });
  }, [transporters]);

  // Filter transporters for admin registry
  const filteredTransporters = useMemo(() => {
    return transporters.filter(t => {
      const matchesSearch = 
        t.companyName.toLowerCase().includes(search.toLowerCase()) || 
        t.ownerName.toLowerCase().includes(search.toLowerCase()) || 
        t.id.toLowerCase().includes(search.toLowerCase()) || 
        t.city.toLowerCase().includes(search.toLowerCase()) ||
        t.mobile.toLowerCase().includes(search.toLowerCase()) ||
        (t.gstNumber && t.gstNumber.toLowerCase().includes(search.toLowerCase())) ||
        (t.panNumber && t.panNumber.toLowerCase().includes(search.toLowerCase()));
      
      let matchesFilter = true;
      if (statusFilter === 'Pending') matchesFilter = t.status === 'Pending';
      else if (statusFilter === 'Approved') matchesFilter = t.status === 'Approved';
      else if (statusFilter === 'Under Review') matchesFilter = t.status === 'Under Review';
      else if (statusFilter === 'Blacklisted') matchesFilter = t.status === 'Blacklisted';
      else if (statusFilter === 'Expired Documents') {
        matchesFilter = Object.values(t.documents).some(d => d.status === 'Expired');
      }

      return matchesSearch && matchesFilter;
    });
  }, [transporters, search, statusFilter]);

  // Document verification actions
  const handleVerifyDoc = (transporterId: string, docKey: keyof TransporterProfile['documents'], status: DocumentStatus) => {
    verifyDocument(transporterId, docKey, status, previewRemarks || 'Verified by KYC Audit');
    
    // Find updated transporter profile to refresh drawer state
    const updated = transporters.find(t => t.id === transporterId);
    if (updated) {
      setSelectedProfile({
        ...updated,
        documents: {
          ...updated.documents,
          [docKey]: { ...updated.documents[docKey], status, remarks: previewRemarks || 'Verified by KYC Audit' }
        }
      });
    }

    toast({
      title: status === 'Verified' ? "Document Approved" : "Document Flagged",
      description: `Document ${docKey} updated status to ${status}.`,
      className: status === 'Verified' ? "bg-green-600 text-white border-none font-bold" : "bg-orange-600 text-white border-none font-bold"
    });
    setPreviewDocKey(null);
    setPreviewRemarks('');
  };

  const handleEditClick = (profile: TransporterProfile) => {
    setEditForm({
      ownerName: profile.ownerName,
      companyName: profile.companyName,
      mobile: profile.mobile,
      email: profile.email,
      fleetSize: profile.fleetSize,
      panNumber: profile.panNumber,
      gstNumber: profile.gstNumber,
      bankName: profile.bankName,
      bankAccount: profile.bankAccount,
      ifsc: profile.ifsc
    });
    setIsEditing(true);
  };

  const handleEditSubmit = (e: React.FormEvent, transporterId: string) => {
    e.preventDefault();
    updateTransporter(transporterId, editForm);
    
    const updated = transporters.find(t => t.id === transporterId);
    if (updated) {
      setSelectedProfile({ ...updated, ...editForm });
    }

    toast({
      title: "Profile Overhauled",
      description: "Transporter registration details updated successfully.",
      className: "bg-green-600 text-white font-bold border-none"
    });
    setIsEditing(false);
  };

  const handleBlacklistConfirm = () => {
    if (!blacklistingTarget) return;
    blacklistTransporter(blacklistingTarget.id);
    
    // Refresh drawer if viewing target
    if (selectedProfile?.id === blacklistingTarget.id) {
      setSelectedProfile(prev => prev ? { ...prev, status: 'Blacklisted' } : null);
    }

    toast({
      title: "Transporter Blacklisted",
      description: `${blacklistingTarget.companyName} locked out from bidding and dispatches.`,
      className: "bg-red-600 text-white border-none font-bold shadow-md"
    });
    setBlacklistingTarget(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2.5 py-1 font-bold">Verified</Badge>;
      case 'Pending': return <Badge className="bg-amber-50 text-amber-700 border border-amber-200/50 px-2.5 py-1 font-bold animate-pulse">Pending Review</Badge>;
      case 'Under Review': return <Badge className="bg-blue-50 text-blue-700 border border-blue-200/50 px-2.5 py-1 font-bold">Under Review</Badge>;
      case 'Blacklisted': return <Badge className="bg-rose-50 text-rose-700 border border-rose-200/50 px-2.5 py-1 font-bold">Blacklisted</Badge>;
      default: return <Badge variant="outline" className="px-2.5 py-1 font-bold">{status}</Badge>;
    }
  };

  const getDocStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'Verified': return <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px] font-bold">Verified</Badge>;
      case 'Pending': return <Badge className="bg-amber-50 text-amber-700 border-none text-[10px] font-bold animate-pulse">Review Pending</Badge>;
      case 'Rejected': return <Badge className="bg-rose-50 text-rose-700 border-none text-[10px] font-bold">Rejected</Badge>;
      case 'Expired': return <Badge className="bg-red-100 text-red-800 border-none text-[10px] font-bold flex items-center gap-1"><AlertTriangle size={9} /> Expired</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden pb-12">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="text-slate-800 h-6 w-6" /> Transporter Registry & Verification
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage transporter registrations, KYC verification, and compliance approvals.</p>
        </div>
        <div className="flex items-center gap-3">
          {duplicateAlerts.length > 0 && (
            <Badge className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 text-xs font-bold animate-pulse flex items-center gap-1.5 rounded-full">
              <ShieldAlert size={13} className="text-amber-600" />
              {duplicateAlerts.length} Compliance Conflicts
            </Badge>
          )}
          {notifications.filter(n => !n.read).length > 0 && (
            <Badge className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1 text-xs font-bold flex items-center gap-1.5 rounded-full">
              <Bell size={13} className="text-rose-600 animate-bounce" />
              {notifications.filter(n => !n.read).length} Alerts
            </Badge>
          )}
        </div>
      </div>

      {/* Modern KPI Stats Analytics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-xs p-4 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute right-2 bottom-2 text-slate-800 opacity-20">
            <Truck size={60} />
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Registry</p>
          <h3 className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">{stats.total}</h3>
          <span className="text-[9px] text-slate-500 font-medium">registered carriers</span>
        </Card>
        
        <Card className="border-0 shadow-xs p-4 bg-white relative overflow-hidden">
          <div className="absolute right-2 bottom-2 text-amber-100 opacity-30">
            <Clock size={60} />
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending Audit</p>
          <h3 className="text-2xl font-extrabold font-mono text-amber-600 mt-1">{stats.pending}</h3>
          <span className="text-[9px] text-slate-500 font-medium">KYC checks remaining</span>
        </Card>

        <Card className="border-0 shadow-xs p-4 bg-white relative overflow-hidden">
          <div className="absolute right-2 bottom-2 text-emerald-100 opacity-30">
            <ShieldCheck size={60} />
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Approved KYC</p>
          <h3 className="text-2xl font-extrabold font-mono text-emerald-600 mt-1">{stats.approved}</h3>
          <span className="text-[9px] text-slate-500 font-medium">compliant fleet partners</span>
        </Card>

        <Card className="border-0 shadow-xs p-4 bg-white relative overflow-hidden">
          <div className="absolute right-2 bottom-2 text-rose-100 opacity-30">
            <ShieldAlert size={60} />
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Blacklisted</p>
          <h3 className="text-2xl font-extrabold font-mono text-rose-600 mt-1">{stats.blacklisted}</h3>
          <span className="text-[9px] text-slate-500 font-medium">denied access</span>
        </Card>

        <Card className="border-0 shadow-xs p-4 bg-white relative overflow-hidden">
          <div className="absolute right-2 bottom-2 text-red-100 opacity-30">
            <AlertTriangle size={60} />
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expired Docs</p>
          <h3 className="text-2xl font-extrabold font-mono text-red-600 mt-1">{stats.expiredDocs}</h3>
          <span className="text-[9px] text-slate-500 font-medium">require renewals</span>
        </Card>

        <Card className="border-0 shadow-xs p-4 bg-white relative overflow-hidden">
          <div className="absolute right-2 bottom-2 text-slate-200 opacity-30">
            <Activity size={60} />
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Heavy Fleet</p>
          <h3 className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{stats.activeFleet}</h3>
          <span className="text-[9px] text-slate-500 font-medium">live trucks registered</span>
        </Card>
      </div>

      {/* Enterprise Two-Column Workspace Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Compliance Alerts, Expiry Lists, AI Risk Radar */}
        <div className="xl:col-span-1 space-y-6">

          {/* Pending KYC Reviews List */}
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 p-5 bg-slate-50/20">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-500" /> Pending KYC Reviews ({pendingReviews.length})
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-semibold border-slate-200">Action Required</Badge>
              </div>
              <CardDescription className="text-[11px] text-slate-400 mt-0.5">Transporters waiting for manual document verification.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {pendingReviews.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">All transporters are verified.</p>
                ) : (
                  pendingReviews.map((tr) => (
                    <motion.div 
                      key={tr.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={() => { setSelectedProfile(tr); setIsEditing(false); }}
                      className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 hover:border-slate-200 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">{tr.companyName}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>Owner: {tr.ownerName}</span>
                          <span>•</span>
                          <span className="font-mono text-[9px] font-bold">{tr.id}</span>
                        </div>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[9px] uppercase px-1.5 py-0.5">
                        {tr.status}
                      </Badge>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Expired Documents compliance alerts queue */}
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 p-5 bg-slate-50/20">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-red-500" /> Compliance Expiry Alerts ({expiredAlerts.length})
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-semibold text-red-600 bg-red-50 border-red-100">Expired</Badge>
              </div>
              <CardDescription className="text-[11px] text-slate-400 mt-0.5">Active profiles containing expired transport certificates.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {expiredAlerts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">No expired credentials detected.</p>
                ) : (
                  expiredAlerts.map((alert) => (
                    <motion.div 
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={() => { setSelectedProfile(alert.transporter); setIsEditing(false); }}
                      className="p-3 bg-red-50/20 hover:bg-red-50/40 border border-red-100/50 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-800">{alert.companyName}</p>
                        <p className="text-[10px] text-red-700 font-semibold capitalize flex items-center gap-1">
                          <XCircle size={10} /> {alert.docName} Expired
                        </p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:bg-red-100/30">
                        <Eye size={12} />
                      </Button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* AI Risk Radar: Trust Scores */}
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 p-5 bg-slate-50/20">
              <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu size={14} className="text-slate-800" /> AI Trust Audit & Verification Scores
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-400 mt-0.5">Algorithmic risk evaluation based on verified documentation ratios.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
              {aiRiskQueue.map((item) => (
                <div key={item.transporter.id} className="space-y-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{item.transporter.companyName}</p>
                      <span className="text-[9px] text-slate-400 font-mono">ID: {item.transporter.id}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold font-mono text-xs ${
                        item.riskLevel === 'Safe' ? 'text-emerald-600' :
                        item.riskLevel === 'Needs Review' ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {item.score}% TRUST
                      </span>
                      <p className="text-[9px] text-slate-400 font-medium capitalize">{item.riskLevel} Risk</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        item.riskLevel === 'Safe' ? 'bg-emerald-500' :
                        item.riskLevel === 'Needs Review' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Duplicate Detection Alerts */}
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 p-5 bg-slate-50/20">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldIcon size={14} className="text-amber-500" /> Database Duplicate Scanner
                </CardTitle>
                <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[9px] uppercase px-1.5 py-0.5">
                  Real-time Auditing
                </Badge>
              </div>
              <CardDescription className="text-[11px] text-slate-400 mt-0.5">Flagged records sharing identical TAX identifiers or phones.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {duplicateAlerts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">No duplicate tax/phone records found.</p>
                ) : (
                  duplicateAlerts.map((alert) => (
                    <motion.div 
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={() => { setSelectedProfile(alert.transporter); setIsEditing(false); }}
                      className="p-3 bg-amber-50/30 hover:bg-amber-50/60 border border-amber-100 rounded-xl flex items-center justify-between cursor-pointer transition-all animate-pulse"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-800">{alert.companyName}</p>
                        <p className="text-[9px] text-amber-800 font-bold uppercase tracking-wider">
                          Shared {alert.type}: <span className="font-mono">{alert.value}</span>
                        </p>
                      </div>
                      <AlertCircle size={14} className="text-amber-600" />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: Search/Filters, Main Transporter Table, Compliance Actions */}
        <div className="xl:col-span-2 space-y-6">
          
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search Bar matching Name, Mobile, GST, PAN */}
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <Input 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search Name, Phone, GSTIN or PAN..." 
                    className="pl-9 bg-gray-50 border-gray-200 text-xs h-9" 
                  />
                </div>

                {/* Filter Selector */}
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="flex h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-none outline-none focus:ring-1 focus:ring-primary text-slate-600"
                  >
                    <option value="All">All Carriers</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Approved">Verified KYC</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Blacklisted">Blacklisted</option>
                    <option value="Expired Documents">Expired Documents</option>
                  </select>
                </div>

              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-bold text-slate-500 uppercase text-[10px] pl-6 py-3.5">Carrier / Account ID</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase text-[10px]">Owner / Mobile</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase text-[10px]">Fleet size</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase text-[10px] text-center">AI Trust Score</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase text-[10px]">Documents Uploaded</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase text-[10px]">Verification Status</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase text-[10px] text-right pr-6">Audit Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredTransporters.map((tr) => {
                        const hasExpiredDocs = Object.values(tr.documents).some(d => d.status === 'Expired');
                        
                        // Calculate trust score
                        const docValues = Object.values(tr.documents);
                        const verifiedDocs = docValues.filter(d => d.status === 'Verified').length;
                        const score = Math.round((verifiedDocs / docValues.length) * 100);

                        return (
                          <TableRow 
                            key={tr.id} 
                            onClick={() => { setSelectedProfile(tr); setIsEditing(false); }}
                            className="hover:bg-slate-50/50 cursor-pointer transition-all border-b last:border-0"
                          >
                            <TableCell className="pl-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                  tr.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                  tr.status === 'Blacklisted' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {tr.companyName.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    {tr.companyName}
                                    {hasExpiredDocs && (
                                      <Badge className="bg-rose-100 text-rose-800 text-[8px] font-bold border-none px-1 py-0 h-4">Expired Docs</Badge>
                                    )}
                                  </p>
                                  <p className="text-[9px] text-gray-400 font-mono uppercase font-bold">{tr.id}</p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-800 flex items-center gap-1"><User size={10} className="text-slate-400" /> {tr.ownerName}</span>
                                <span className="text-[10px] text-slate-500 mt-0.5">{tr.mobile}</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge variant="outline" className="border-slate-200 text-slate-600 font-bold text-[9px] px-2 py-0.5">
                                {tr.fleetSize} Heavy Fleet
                              </Badge>
                            </TableCell>

                            <TableCell className="text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded-full ${
                                  score >= 80 ? 'bg-emerald-50 text-emerald-700' :
                                  score >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {score}%
                                </span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-1 text-slate-300">
                                {/* DL, PAN, GST, Insurance, RC, Cancelled Cheque */}
                                <span className={tr.documents.aadhaar.status === 'Verified' ? "text-emerald-500" : tr.documents.aadhaar.status === 'Expired' ? "text-rose-500" : tr.documents.aadhaar.status === 'Rejected' ? "text-rose-600" : "text-slate-300"} title="Aadhaar ID"><CheckCircle2 size={13} /></span>
                                <span className={tr.documents.panCard.status === 'Verified' ? "text-emerald-500" : tr.documents.panCard.status === 'Expired' ? "text-rose-500" : tr.documents.panCard.status === 'Rejected' ? "text-rose-600" : "text-slate-300"} title="PAN Card"><CheckCircle2 size={13} /></span>
                                <span className={tr.documents.gstCert.status === 'Verified' ? "text-emerald-500" : tr.documents.gstCert.status === 'Expired' ? "text-rose-500" : tr.documents.gstCert.status === 'Rejected' ? "text-rose-600" : "text-slate-300"} title="GST Certificate"><CheckCircle2 size={13} /></span>
                                <span className={tr.documents.insurance.status === 'Verified' ? "text-emerald-500" : tr.documents.insurance.status === 'Expired' ? "text-rose-500" : tr.documents.insurance.status === 'Rejected' ? "text-rose-600" : "text-slate-300"} title="Insurance Certificate"><CheckCircle2 size={13} /></span>
                                <span className={tr.documents.vehicleRc.status === 'Verified' ? "text-emerald-500" : tr.documents.vehicleRc.status === 'Expired' ? "text-rose-500" : tr.documents.vehicleRc.status === 'Rejected' ? "text-rose-600" : "text-slate-300"} title="RC Details"><CheckCircle2 size={13} /></span>
                                <span className={tr.documents.drivingLicense.status === 'Verified' ? "text-emerald-500" : tr.documents.drivingLicense.status === 'Expired' ? "text-rose-500" : tr.documents.drivingLicense.status === 'Rejected' ? "text-rose-600" : "text-slate-300"} title="Driving License"><CheckCircle2 size={13} /></span>
                              </div>
                            </TableCell>

                            <TableCell>{getStatusBadge(tr.status)}</TableCell>

                            <TableCell className="text-right pr-6" onClick={e => e.stopPropagation()}>
                              <div className="flex justify-end gap-1.5">
                                <Button 
                                  onClick={() => { setSelectedProfile(tr); setIsEditing(false); }}
                                  size="sm" 
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 h-7 text-[10px] font-bold uppercase rounded"
                                >
                                  View Docs
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                                      <MoreHorizontal size={14} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="gap-2 text-xs" onClick={() => handleEditClick(tr)}>
                                      <Edit2 size={13} /> Edit Profile
                                    </DropdownMenuItem>
                                    {tr.status !== 'Blacklisted' && (
                                      <DropdownMenuItem className="gap-2 text-rose-600 font-bold text-xs" onClick={() => setBlacklistingTarget(tr)}>
                                        <ShieldAlert size={13} /> Blacklist Carrier
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* DRAWER: Transporter Profile & Document Audit Drawer */}
      <AnimatePresence>
        {selectedProfile && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProfile(null)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Drawer Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col font-sans"
            >
              {/* Drawer Header */}
              <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-slate-800 text-emerald-400 border border-slate-700 font-bold text-[9px] uppercase px-2 py-0.5">
                      Carrier Audit Hub
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">ID: {selectedProfile.id}</span>
                  </div>
                  <h3 className="text-lg font-bold">{selectedProfile.companyName}</h3>
                  <p className="text-xs text-slate-400">Managed by: {selectedProfile.ownerName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedProfile(null)}
                    className="h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X size={18} />
                  </Button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                
                {/* General Actions row */}
                <div className="flex justify-between items-center bg-slate-50 border rounded-xl p-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account Status</span>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(selectedProfile.status)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button 
                        onClick={() => handleEditClick(selectedProfile)}
                        size="sm" 
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 gap-1.5 h-8 font-bold text-xs uppercase"
                      >
                        <Edit2 size={12} /> Edit Details
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setIsEditing(false)}
                        size="sm" 
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 gap-1.5 h-8 font-bold text-xs uppercase"
                      >
                        Cancel
                      </Button>
                    )}
                    {selectedProfile.status !== 'Blacklisted' && (
                      <Button 
                        onClick={() => setBlacklistingTarget(selectedProfile)}
                        size="sm" 
                        className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5 h-8 font-bold text-xs uppercase"
                      >
                        <ShieldAlert size={12} /> Blacklist
                      </Button>
                    )}
                  </div>
                </div>

                {/* Edit Form or Display Specs */}
                {isEditing ? (
                  <form onSubmit={(e) => handleEditSubmit(e, selectedProfile.id)} className="space-y-4 border rounded-xl p-5 bg-slate-50/50">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Modify Registration Info</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Owner Name</label>
                        <Input 
                          value={editForm.ownerName}
                          onChange={e => setEditForm(prev => ({ ...prev, ownerName: e.target.value }))}
                          className="bg-white h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Company Name</label>
                        <Input 
                          value={editForm.companyName}
                          onChange={e => setEditForm(prev => ({ ...prev, companyName: e.target.value }))}
                          className="bg-white h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile No</label>
                        <Input 
                          value={editForm.mobile}
                          onChange={e => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                          className="bg-white h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                        <Input 
                          value={editForm.email}
                          onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-white h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Heavy Fleet Size</label>
                        <Input 
                          type="number"
                          value={editForm.fleetSize}
                          onChange={e => setEditForm(prev => ({ ...prev, fleetSize: parseInt(e.target.value) || 0 }))}
                          className="bg-white h-9 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider h-9 mt-2">
                      Save Changes
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-5">
                    
                    {/* Contact details */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Coordinates</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg">
                          <Phone size={13} className="text-slate-400" />
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Mobile / WhatsApp</span>
                            <span className="font-semibold text-slate-800">{selectedProfile.mobile}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg">
                          <Mail size={13} className="text-slate-400" />
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Email Address</span>
                            <span className="font-semibold text-slate-800">{selectedProfile.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg col-span-2">
                          <MapPin size={13} className="text-slate-400" />
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Corporate Address</span>
                            <span className="font-semibold text-slate-800 leading-snug">{selectedProfile.address}, {selectedProfile.city}, {selectedProfile.state}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tax & Banking Details */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tax & Settlement Accounts</h4>
                      <div className="border border-slate-100 rounded-xl p-4.5 space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-4 pb-2 border-b">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">PAN Card Registration</span>
                            <span className="font-bold text-slate-800 font-mono">{selectedProfile.panNumber}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">GST Identification (GSTIN)</span>
                            <span className="font-bold text-slate-800 font-mono">{selectedProfile.gstNumber}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-1">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Bank Payout Destination</span>
                            <span className="font-bold text-slate-800">{selectedProfile.bankName}</span>
                            <span className="text-[10px] text-slate-500 block font-mono">A/C: {selectedProfile.bankAccount}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">IFSC: {selectedProfile.ifsc}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">VPA UPI Address</span>
                            <span className="font-bold text-slate-800 font-mono">{selectedProfile.upiId}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* KYC Document Audit Hub */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>KYC Document Registry</span>
                        <span className="text-[10px] text-slate-400 lowercase font-medium">Click document to verify/preview</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(selectedProfile.documents).map(([key, value]) => {
                          const val = value as TransporterProfile['documents'][keyof TransporterProfile['documents']];
                          return (
                            <div 
                              key={key} 
                              onClick={() => { setPreviewDocKey(key as any); setPreviewRemarks(val.remarks); }}
                              className="border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer rounded-xl p-3.5 flex justify-between items-center transition-all"
                            >
                              <div className="flex items-center gap-3 text-xs">
                                <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
                                  <FileText size={14} />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-800 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                  {val.expiryDate && (
                                    <span className="text-[10px] text-slate-400 block">Expires: {val.expiryDate}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getDocStatusBadge(val.status)}
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400">
                                  <Eye size={12} />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DOCUMENT PREVIEW MODAL */}
      <Dialog open={!!previewDocKey} onOpenChange={(val) => !val && setPreviewDocKey(null)}>
        <DialogContent className="sm:max-w-[750px] border-0 rounded-2xl shadow-xl bg-white p-0 overflow-hidden font-sans">
          {selectedProfile && previewDocKey && (() => {
            const doc = selectedProfile.documents[previewDocKey];
            return (
              <div className="flex flex-col">
                <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Document Audit</span>
                    <h3 className="text-sm font-bold capitalize">{previewDocKey.replace(/([A-Z])/g, ' $1')}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setZoomScale(s => Math.min(2, s + 0.1))} className="h-7 w-7 text-slate-400 hover:text-white"><ZoomIn size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setZoomScale(s => Math.max(0.5, s - 0.1))} className="h-7 w-7 text-slate-400 hover:text-white"><ZoomOut size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} className="h-7 w-7 text-slate-400 hover:text-white"><Maximize2 size={14} /></Button>
                  </div>
                </div>

                {/* Main preview split */}
                <div className="grid grid-cols-1 md:grid-cols-3 h-[450px]">
                  
                  {/* Left: Interactive Media Preview */}
                  <div className="md:col-span-2 bg-slate-950 flex items-center justify-center overflow-hidden p-6 relative">
                    <img 
                      src={doc.fileUrl} 
                      alt="Verified Doc Preview"
                      className="max-h-full max-w-full rounded shadow-md object-contain transition-transform"
                      style={{ transform: `scale(${zoomScale})` }}
                    />
                  </div>

                  {/* Right: Audit decisions */}
                  <div className="md:col-span-1 border-l border-slate-100 p-5 flex flex-col justify-between bg-slate-50/50">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Document Status</span>
                        <div className="mt-1.5">{getDocStatusBadge(doc.status)}</div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Audit Remarks / Feedback</label>
                        <textarea
                          value={previewRemarks}
                          onChange={e => setPreviewRemarks(e.target.value)}
                          placeholder="e.g. Aadhaar matched with NSDL records..."
                          className="w-full h-[120px] rounded-lg border border-slate-200 p-2.5 text-xs outline-none bg-white focus:ring-1 focus:ring-primary leading-snug"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <Button 
                        onClick={() => handleVerifyDoc(selectedProfile.id, previewDocKey, 'Verified')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 uppercase text-[10px] tracking-wider shadow-xs"
                      >
                        Approve Document
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          onClick={() => handleVerifyDoc(selectedProfile.id, previewDocKey, 'Rejected')}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 font-bold h-9 uppercase text-[9px] tracking-wider"
                        >
                          Reject Doc
                        </Button>
                        <Button 
                          onClick={() => handleVerifyDoc(selectedProfile.id, previewDocKey, 'Expired')}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 font-bold h-9 uppercase text-[9px] tracking-wider"
                        >
                          Mark Expired
                        </Button>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="p-4 bg-slate-100 border-t flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-medium">Remarks: {doc.remarks}</span>
                  <Button variant="outline" onClick={() => setPreviewDocKey(null)} className="h-8 text-xs">
                    Cancel Audit
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* MODAL: Blacklist Confirmation Modal */}
      <Dialog open={!!blacklistingTarget} onOpenChange={(val) => !val && setBlacklistingTarget(null)}>
        <DialogContent className="sm:max-w-[400px] border-0 rounded-2xl shadow-xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-600 animate-pulse" /> Blacklist Carrier Partner
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-2 leading-snug">
              Are you absolutely sure you want to blacklist <span className="font-extrabold text-slate-900">{blacklistingTarget?.companyName}</span>?
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3.5 mt-2 leading-relaxed">
            <strong>WARNING:</strong> Blacklisting blocks the carrier from bidding on open loads, receiving assigned trips, and shuts down their active carrier dashboard workspace immediately.
          </p>
          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <Button variant="outline" onClick={() => setBlacklistingTarget(null)} className="border-slate-200">
              Cancel Audit
            </Button>
            <Button 
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              onClick={handleBlacklistConfirm}
            >
              Confirm Blacklist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
