import React, { useState, useMemo } from 'react';
import { 
  UserCheck, Search, Filter, MoreHorizontal, CheckCircle2, 
  XCircle, AlertCircle, Clock, ShieldCheck, Eye, Truck, MapPin, 
  Calendar, Weight, CircleDollarSign, ArrowRight, Bell, User,
  Mail, Phone, FileText, Download, ShieldAlert, X, Edit2, Check,
  Maximize2, Minimize2, ZoomIn, ZoomOut, AlertTriangle, Building
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useLoadStore } from '@/store/loadStore';
import { useTransporterStore, type TransporterProfile, type DocumentStatus } from '@/store/transporterStore';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Transporters() {
  const { toast } = useToast();
  const { loads, assignVehicle } = useLoadStore();
  const { transporters, notifications, markNotificationsAsRead, updateTransporter, verifyDocument, blacklistTransporter } = useTransporterStore();
  
  // Tab states & search filters
  const [selectedTab, setSelectedTab] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Carrier Portal Dashboard Active Transporter
  const [selectedCarrier, setSelectedCarrier] = useState('Delhi Roadlines');
  
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

  // Fleet Allocation Form States
  const [allocationForm, setAllocationForm] = useState<{ [loadId: string]: { vehicle: string; driver: string } }>({});

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    if (value === 'portal') {
      markNotificationsAsRead();
    }
  };

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

  // Active assigned loads for the portal view
  const assignedLoads = React.useMemo(() => {
    return loads.filter(l => l.assignedTransporter?.companyName === selectedCarrier);
  }, [loads, selectedCarrier]);

  const carrierNotifications = React.useMemo(() => {
    return notifications.filter(n => {
      const targetLoad = loads.find(l => l.id === n.loadId);
      return targetLoad?.assignedTransporter?.companyName === selectedCarrier || n.message.includes(selectedCarrier);
    });
  }, [notifications, selectedCarrier, loads]);

  // Filter transporters for admin registry
  const filteredTransporters = React.useMemo(() => {
    return transporters.filter(t => {
      const matchesSearch = 
        t.companyName.toLowerCase().includes(search.toLowerCase()) || 
        t.ownerName.toLowerCase().includes(search.toLowerCase()) || 
        t.id.toLowerCase().includes(search.toLowerCase()) || 
        t.city.toLowerCase().includes(search.toLowerCase());
      
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

  const handleAllocationSubmit = (e: React.FormEvent, loadId: string) => {
    e.preventDefault();
    const form = allocationForm[loadId];
    if (!form || !form.vehicle.trim() || !form.driver.trim()) {
      toast({
        title: "Allocation Pending",
        description: "Please specify both the Vehicle Registration No. and Driver Name.",
        variant: "destructive"
      });
      return;
    }

    assignVehicle(loadId, form.vehicle, form.driver);
    toast({
      title: "Fleet Allocated!",
      description: `Vehicle ${form.vehicle} & Driver ${form.driver} registered for trip.`,
      className: "bg-green-600 text-white border-none font-semibold"
    });
  };

  const handleFormChange = (loadId: string, field: 'vehicle' | 'driver', val: string) => {
    setAllocationForm(prev => ({
      ...prev,
      [loadId]: {
        ...(prev[loadId] || { vehicle: '', driver: '' }),
        [field]: val
      }
    }));
  };

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
      case 'Approved': return <Badge className="bg-emerald-100 text-emerald-700 border-none px-2.5 py-1 font-bold">Verified</Badge>;
      case 'Pending': return <Badge className="bg-amber-100 text-amber-700 border-none px-2.5 py-1 font-bold animate-pulse">Pending</Badge>;
      case 'Under Review': return <Badge className="bg-blue-100 text-blue-700 border-none px-2.5 py-1 font-bold">Under Review</Badge>;
      case 'Blacklisted': return <Badge className="bg-red-100 text-red-700 border-none px-2.5 py-1 font-bold">Blacklisted</Badge>;
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
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transporter Console & KYC</h1>
          <p className="text-sm text-gray-500 mt-1">Manage registration credentials, audit carrier business documents, and verify KYC.</p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.filter(n => !n.read).length > 0 && (
            <Badge className="bg-amber-100 text-amber-800 border-none px-3 py-1 font-bold animate-bounce flex items-center gap-1.5">
              <Bell size={13} className="text-amber-600" />
              {notifications.filter(n => !n.read).length} New Alerts
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-white border-b border-gray-100 rounded-none w-full justify-start h-auto p-0 mb-6 shadow-xs">
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-bold text-xs uppercase tracking-wider text-gray-500 data-[state=active]:text-primary flex items-center gap-1.5"><Building size={14} /> Transporter Registry</TabsTrigger>
          <TabsTrigger value="portal" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-bold text-xs uppercase tracking-wider text-gray-500 data-[state=active]:text-primary flex items-center gap-2">
            <Truck size={14} /> Carrier Operations Portal
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Transporter Registry */}
        <TabsContent value="all" className="mt-0 space-y-6">
          
          {/* KPI Analytics row */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-slate-900 text-white">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Carriers</p>
              <h3 className="text-2xl font-extrabold font-mono text-emerald-400">{stats.total}</h3>
            </Card>
            <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-white">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verification Pending</p>
              <h3 className="text-2xl font-extrabold font-mono text-amber-600">{stats.pending}</h3>
            </Card>
            <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-white">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-semibold">Approved KYC</p>
              <h3 className="text-2xl font-extrabold font-mono text-emerald-600">{stats.approved}</h3>
            </Card>
            <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-white">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Blacklisted</p>
              <h3 className="text-2xl font-extrabold font-mono text-rose-600">{stats.blacklisted}</h3>
            </Card>
            <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-white">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expired Docs</p>
              <h3 className="text-2xl font-extrabold font-mono text-red-600">{stats.expiredDocs}</h3>
            </Card>
            <Card className="border-0 shadow-xs p-4 space-y-1.5 bg-white">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Fleet (Approved)</p>
              <h3 className="text-2xl font-extrabold font-mono text-slate-900">{stats.activeFleet}</h3>
            </Card>
          </div>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <Input 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by carrier name, owner, city..." 
                    className="pl-9 bg-gray-50 border-gray-200 text-xs h-9" 
                  />
                </div>
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
              <div className="rounded-lg border border-gray-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="font-bold text-gray-500 uppercase text-[10px] pl-6 py-3.5">Carrier / Account ID</TableHead>
                      <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Owner & preferred Routes</TableHead>
                      <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Fleet size</TableHead>
                      <TableHead className="font-bold text-gray-500 uppercase text-[10px]">KYC Status Tracker</TableHead>
                      <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Verification Status</TableHead>
                      <TableHead className="font-bold text-gray-500 uppercase text-[10px] text-right pr-6">Audit Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransporters.map((tr) => {
                      // Expired check for quick visual warning
                      const hasExpiredDocs = Object.values(tr.documents).some(d => d.status === 'Expired');
                      
                      return (
                        <TableRow 
                          key={tr.id} 
                          onClick={() => { setSelectedProfile(tr); setIsEditing(false); }}
                          className="hover:bg-slate-50/50 cursor-pointer transition-all"
                        >
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                                tr.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                tr.status === 'Blacklisted' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
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
                              <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{tr.preferredRoutes.join(' | ')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-gray-200 text-gray-600 font-bold text-[10px]">{tr.fleetSize} Heavy Fleet</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-slate-300">
                              {/* Quick indicators of 6 crucial documents */}
                              <span className={tr.documents.aadhaar.status === 'Verified' ? "text-emerald-500" : tr.documents.aadhaar.status === 'Expired' ? "text-rose-500" : "text-slate-300"} title="Aadhaar"><CheckCircle2 size={13} /></span>
                              <span className={tr.documents.panCard.status === 'Verified' ? "text-emerald-500" : tr.documents.panCard.status === 'Expired' ? "text-rose-500" : "text-slate-300"} title="PAN"><CheckCircle2 size={13} /></span>
                              <span className={tr.documents.gstCert.status === 'Verified' ? "text-emerald-500" : tr.documents.gstCert.status === 'Expired' ? "text-rose-500" : "text-slate-300"} title="GST"><CheckCircle2 size={13} /></span>
                              <span className={tr.documents.insurance.status === 'Verified' ? "text-emerald-500" : tr.documents.insurance.status === 'Expired' ? "text-rose-500" : "text-slate-300"} title="Insurance"><CheckCircle2 size={13} /></span>
                              <span className={tr.documents.vehicleRc.status === 'Verified' ? "text-emerald-500" : tr.documents.vehicleRc.status === 'Expired' ? "text-rose-500" : "text-slate-300"} title="RC"><CheckCircle2 size={13} /></span>
                              <span className={tr.documents.drivingLicense.status === 'Verified' ? "text-emerald-500" : tr.documents.drivingLicense.status === 'Expired' ? "text-rose-500" : "text-slate-300"} title="DL"><CheckCircle2 size={13} /></span>
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
                                View File
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                                    <MoreHorizontal size={14} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="gap-2 text-xs" onClick={() => handleEditClick(tr)}><Edit2 size={13} /> Edit Account</DropdownMenuItem>
                                  {tr.status !== 'Blacklisted' && (
                                    <DropdownMenuItem className="gap-2 text-red-600 font-bold text-xs" onClick={() => setBlacklistingTarget(tr)}><ShieldAlert size={13} /> Blacklist Carrier</DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Carrier Operations Portal View */}
        <TabsContent value="portal" className="mt-0">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left Workspace: Switcher & Operations alerts log */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* Transporter Switcher */}
              <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-5">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-300">Carrier Workspace</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Switch context to view portal from carrier side.</CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Operating Carrier</label>
                    <select
                      value={selectedCarrier}
                      onChange={e => setSelectedCarrier(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary text-slate-700"
                    >
                      <option value="Delhi Roadlines">Delhi Roadlines</option>
                      <option value="SafeWay Express">SafeWay Express</option>
                      <option value="FastFreight Solutions">FastFreight Solutions</option>
                      <option value="Reliable Cargo Services">Reliable Cargo Services</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Carrier Notifications Feed */}
              <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 p-5">
                  <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Bell size={15} className="text-amber-500 animate-pulse" /> Dispatch Alerts Log
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">KYC decisions and trip releases.</CardDescription>
                </CardHeader>
                <CardContent className="p-5 max-h-[350px] overflow-y-auto space-y-3.5 custom-scrollbar">
                  {carrierNotifications.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-6">No dispatch alerts generated yet.</p>
                  ) : (
                    carrierNotifications.map((notif, index) => (
                      <div key={index} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-3">
                        <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={13} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LOAD REF: {notif.loadId}</p>
                          <p className="text-xs text-slate-700 leading-snug">{notif.message}</p>
                          <p className="text-[9px] text-slate-400">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Workspace: Assigned Loads & Active Fleet Assignments */}
            <div className="xl:col-span-2 space-y-6">
              <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 p-5">
                  <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600 animate-pulse" />
                    Trip Allocation Queue
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Provision active vehicles and drivers for confirmed dispatches.</CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  {assignedLoads.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <Truck size={40} className="text-slate-200 mx-auto" />
                      <p className="text-sm text-slate-400 italic font-medium">No active dispatches waiting for vehicle assignment.</p>
                      <p className="text-xs text-slate-400/70">Assigned freight contracts will display here for driver allocations.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {assignedLoads.map((load) => {
                        const form = allocationForm[load.id] || { vehicle: '', driver: '' };
                        return (
                          <div key={load.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/30">
                            
                            {/* Trip title */}
                            <div className="p-4 bg-slate-100 border-b flex justify-between items-center">
                              <div className="space-y-0.5">
                                <h3 className="text-sm font-bold text-slate-800">
                                  Load ID: <span className="font-mono text-emerald-700">{load.id}</span>
                                </h3>
                                <p className="text-xs text-slate-400 font-mono">Trip Ref: {load.tripId}</p>
                              </div>
                              <span className="text-xs font-bold text-slate-700 font-mono">
                                {load.tonnes} T | {load.product}
                              </span>
                            </div>

                            {/* Transit Details */}
                            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-3 md:col-span-2">
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Transit Route</p>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800 bg-white border px-2.5 py-1 rounded-md shadow-2xs">
                                      {load.from}
                                    </span>
                                    {load.stops?.map((stop, idx) => (
                                      <React.Fragment key={idx}>
                                        <ArrowRight size={12} className="text-orange-400" />
                                        <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded">
                                          {stop}
                                        </span>
                                      </React.Fragment>
                                    ))}
                                    <ArrowRight size={12} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-800 bg-white border px-2.5 py-1 rounded-md shadow-2xs">
                                      {load.to}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3.5">
                                  <div className="flex items-center gap-2 text-xs">
                                    <Weight size={14} className="text-slate-400" />
                                    <div>
                                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Base Freight</span>
                                      <span className="font-bold text-slate-800">₹{load.totalFreight?.toLocaleString('en-IN')}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <Calendar size={14} className="text-slate-400" />
                                    <div>
                                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Planned Dispatch</span>
                                      <span className="font-bold text-slate-800">{load.dispatchDate}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Allocation Controls */}
                              <div className="border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 space-y-4">
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Fleet Assignment</p>
                                  
                                  {load.assignedVehicle ? (
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 space-y-1 text-xs">
                                      <p className="text-emerald-800 font-bold flex items-center gap-1.5"><Truck size={13} /> Vehicle Allocated</p>
                                      <p className="text-slate-700 font-mono font-bold mt-1.5">{load.assignedVehicle}</p>
                                      <p className="text-slate-500 font-medium">{load.assignedDriver}</p>
                                    </div>
                                  ) : (
                                    <form onSubmit={(e) => handleAllocationSubmit(e, load.id)} className="space-y-3">
                                      <Input 
                                        value={form.vehicle}
                                        onChange={e => handleFormChange(load.id, 'vehicle', e.target.value)}
                                        placeholder="Vehicle No (e.g. MH-12-PQ-9876)"
                                        className="bg-white border-slate-200 text-xs h-8 shadow-none"
                                      />
                                      <Input 
                                        value={form.driver}
                                        onChange={e => handleFormChange(load.id, 'driver', e.target.value)}
                                        placeholder="Driver Name"
                                        className="bg-white border-slate-200 text-xs h-8 shadow-none"
                                      />
                                      <Button 
                                        type="submit"
                                        className="w-full bg-primary hover:bg-primary-hover text-white text-[10px] uppercase font-bold h-8 tracking-wider shadow-xs"
                                      >
                                        Confirm Dispatch
                                      </Button>
                                    </form>
                                  )}
                                </div>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </TabsContent>
      </Tabs>

      {/* DRAWER: Transporter Profile & Document Audit Drawer */}
      <AnimatePresence>
        {selectedProfile && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProfile(null)}
              className="fixed inset-0 bg-black z-40"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[620px] bg-white z-50 shadow-2xl flex flex-col border-l border-slate-100"
            >
              {/* Drawer Header */}
              <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider font-mono">
                      KYC Portal
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
                    <Button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider h-9">
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

      {/* MODAL 5: Blacklist Confirmation Modal */}
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
