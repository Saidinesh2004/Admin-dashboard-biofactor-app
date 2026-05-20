import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Download, Plus, Eye, Edit, Trash2, ArrowRight,
  MapPin, Calendar, Weight, CircleDollarSign, Truck, CheckCircle2,
  Clock, X, BarChart3, TrendingUp, HelpCircle, Star, ShieldCheck, 
  Award, Sparkles, FileSpreadsheet, ChevronRight, AlertTriangle,
  Coins, MessageSquare, Building2
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLoadStore, type Load, type Bid, type Transporter } from '@/store/loadStore';
import { exportToExcel } from '@/utils/exportCsv';

export default function ManageLoads() {
  const { toast } = useToast();
  const { loads, updateLoad, deleteLoad, approveBid, rejectBid, negotiateBid, autoCloseExpiredLoads, fetchBidsForLoad } = useLoadStore();
  
  // Filtering & Search for Main Table
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Drawer / Modals State
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const [editingLoad, setEditingLoad] = useState<Load | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Active Bidding States inside Drawer
  const [bidSearch, setBidSearch] = useState('');
  const [bidSort, setBidSort] = useState<'asc' | 'desc'>('asc');

  // Fetch live bids whenever a load is selected for viewing
  useEffect(() => {
    if (selectedLoadId) {
      fetchBidsForLoad(selectedLoadId);
    }
  }, [selectedLoadId, fetchBidsForLoad]);

  // Auto-close expired loads on mount and every 60 seconds
  useEffect(() => {
    const checkAndClose = () => {
      const closedCount = autoCloseExpiredLoads();
      if (closedCount > 0) {
        toast({
          title: `${closedCount} Load${closedCount > 1 ? 's' : ''} Auto-Closed`,
          description: `${closedCount} load${closedCount > 1 ? 's have' : ' has'} passed their dispatch deadline and been marked as Completed.`,
          className: 'bg-slate-800 text-white border-none'
        });
      }
    };

    checkAndClose(); // Run immediately on mount
    const interval = setInterval(checkAndClose, 60000); // Re-check every 60s
    return () => clearInterval(interval);
  }, []);

  // Nested Modals State inside Drawer
  const [negotiatingBid, setNegotiatingBid] = useState<{ loadId: string; bid: Bid } | null>(null);
  const [counterOffer, setCounterOffer] = useState('');
  const [negotiationRemarks, setNegotiationRemarks] = useState('');
  const [negotiationValidTill, setNegotiationValidTill] = useState('2026-05-30');
  const [negotiationPriority, setNegotiationPriority] = useState('Medium');
  
  const [rejectConfirmBid, setRejectConfirmBid] = useState<{ loadId: string; bidId: string; transporterName: string } | null>(null);
  const [viewingTransporter, setViewingTransporter] = useState<Transporter | null>(null);

  // Edit Load Form State
  const [editForm, setEditForm] = useState({
    from: '',
    stops: [] as string[],
    to: '',
    product: '',
    tonnes: 0,
    ratePerTonne: 0,
    dispatchDate: '',
    status: 'Open' as Load['status']
  });

  // Get the selected load dynamically from the store to ensure reactive updates
  const selectedLoad = useMemo(() => {
    return loads.find(l => l.id === selectedLoadId) || null;
  }, [loads, selectedLoadId]);

  // Dynamic Search & Sort Logic for Bids inside Drawer
  const filteredBids = useMemo(() => {
    if (!selectedLoad || !selectedLoad.bids) return [];
    
    let list = [...selectedLoad.bids];
    
    // Search by Transporter Name or Vehicle Type
    if (bidSearch.trim() !== '') {
      const query = bidSearch.toLowerCase();
      list = list.filter(b => 
        b.transporterName.toLowerCase().includes(query) ||
        b.vehicleType.toLowerCase().includes(query)
      );
    }
    
    // Sort by Bid Amount: Ascending or Descending
    list.sort((a, b) => bidSort === 'asc' ? a.bidAmount - b.bidAmount : b.bidAmount - a.bidAmount);
    
    return list;
  }, [selectedLoad, bidSearch, bidSort]);

  // Dynamic Search & Filter Logic for Main Table
  const filteredLoads = useMemo(() => {
    return loads.filter(l => {
      const stopsMatch = l.stops ? l.stops.some(stop => stop.toLowerCase().includes(search.toLowerCase())) : false;
      const matchesSearch = 
        l.id.toLowerCase().includes(search.toLowerCase()) || 
        l.from.toLowerCase().includes(search.toLowerCase()) || 
        l.to.toLowerCase().includes(search.toLowerCase()) || 
        l.product.toLowerCase().includes(search.toLowerCase()) ||
        stopsMatch;
        
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [loads, search, statusFilter]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = loads.length;
    const open = loads.filter(l => l.status === 'Open').length;
    const assigned = loads.filter(l => l.status === 'Assigned & Dispatched').length;
    const completed = loads.filter(l => l.status === 'Completed').length;
    const revenue = loads
      .filter(l => l.status === 'Completed' || l.status === 'Assigned & Dispatched')
      .reduce((sum, l) => sum + (l.totalFreight || 0), 0);
    const activeVehicles = assigned;
    
    return { total, open, assigned, completed, revenue, activeVehicles };
  }, [loads]);

  const getStatusBadge = (status: Load['status']) => {
    switch (status) {
      case 'Open': 
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-3 py-1 font-semibold">Open</Badge>;
      case 'Assigned & Dispatched': 
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none px-3 py-1 font-semibold">Assigned & Dispatched</Badge>;
      case 'Negotiation In Progress': 
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-3 py-1 font-semibold">Negotiating</Badge>;
      case 'Awaiting New Bids': 
        return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-none px-3 py-1 font-semibold">Awaiting Bids</Badge>;
      case 'Completed': 
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-none px-3 py-1 font-semibold">Completed</Badge>;
      default: 
        return <Badge variant="outline" className="px-3 py-1 font-semibold">{status}</Badge>;
    }
  };

  const getBidStatusBadge = (status: Bid['status']) => {
    switch (status) {
      case 'Approved':
      case 'Selected':
        return <Badge className="bg-green-100 text-green-800 border-none px-2 py-0.5 text-xs font-bold animate-pulse">Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 border-none px-2 py-0.5 text-xs font-bold">Rejected</Badge>;
      case 'Negotiating':
        return <Badge className="bg-amber-100 text-amber-800 border-none px-2 py-0.5 text-xs font-bold">Negotiating</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-none px-2 py-0.5 text-xs font-bold">Pending</Badge>;
    }
  };

  const handleExport = () => {
    const data = filteredLoads.map(l => ({
      'Load ID': l.id,
      'From': l.from,
      'Stops': l.stops ? l.stops.join(' -> ') : 'None',
      'To': l.to,
      'Product': l.product,
      'Quantity (Tonnes)': l.tonnes,
      'Rate/Tonne (INR)': l.ratePerTonne,
      'Total Freight (INR)': l.totalFreight,
      'Dispatch Date': l.dispatchDate,
      'Status': l.status
    }));
    exportToExcel(data, 'Biofactor_Loads.xls');
    toast({ 
      title: 'Export Successful', 
      description: 'Loads database has been downloaded as an Excel spreadsheet.',
      className: "bg-green-600 text-white border-none"
    });
  };

  const handleExportBidsComparison = (load: Load) => {
    if (!load.bids) return;
    const data = load.bids.map(b => ({
      'Rank': b.rank,
      'Transporter': b.transporterName,
      'Vehicle Type': b.vehicleType,
      'Bid Amount (INR)': b.bidAmount,
      'Rate/Tonne': b.pricePerTonne,
      'Rating': b.driverRating,
      'Experience (Years)': b.experienceYears,
      'Verification Status': b.verificationStatus.join(', '),
      'Bid Status': b.status
    }));
    exportToExcel(data, `Bid_Comparison_${load.id}.xls`);
    toast({
      title: "Comparison Exported",
      description: "Transporter comparison sheet downloaded successfully.",
      className: "bg-green-600 text-white border-none"
    });
  };

  const handleDelete = (id: string) => {
    deleteLoad(id);
    setDeleteConfirmId(null);
    toast({ 
      title: 'Load Deleted', 
      description: `Load ${id} has been permanently deleted.`,
      className: "bg-green-600 text-white border-none"
    });
  };

  const startEdit = (load: Load) => {
    setEditingLoad(load);
    setEditForm({
      from: load.from,
      stops: [...(load.stops || [])],
      to: load.to,
      product: load.product,
      tonnes: load.tonnes,
      ratePerTonne: load.ratePerTonne,
      dispatchDate: load.dispatchDate,
      status: load.status
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoad) return;
    
    const totalFreight = editForm.tonnes * editForm.ratePerTonne;
    
    updateLoad(editingLoad.id, {
      from: editForm.from,
      stops: editForm.stops.filter(s => s.trim() !== ''),
      to: editForm.to,
      product: editForm.product,
      tonnes: editForm.tonnes,
      ratePerTonne: editForm.ratePerTonne,
      totalFreight: totalFreight,
      dispatchDate: editForm.dispatchDate,
      status: editForm.status
    });
    
    setEditingLoad(null);
    toast({
      title: 'Load Updated',
      description: `Load ${editingLoad.id} updated successfully.`,
      className: "bg-green-600 text-white border-none"
    });
  };

  const handleEditStopChange = (index: number, val: string) => {
    const newStops = [...editForm.stops];
    newStops[index] = val;
    setEditForm(prev => ({ ...prev, stops: newStops }));
  };

  // Bid Approval Workflow
  const handleApproveBid = (loadId: string, bidId: string, transporterName: string) => {
    approveBid(loadId, bidId);
    toast({
      title: "Transporter Assigned!",
      description: `Bidding closed. ${transporterName} has been assigned to load ${loadId}.`,
      className: "bg-green-600 text-white border-none shadow-xl"
    });
  };

  // Bid Rejection Workflow
  const handleRejectBid = () => {
    if (!rejectConfirmBid) return;
    rejectBid(rejectConfirmBid.loadId, rejectConfirmBid.bidId);
    toast({
      title: "Bid Rejected",
      description: `Bid from ${rejectConfirmBid.transporterName} was rejected.`,
      variant: "destructive"
    });
    setRejectConfirmBid(null);
  };

  // Negotiation Workflow
  const handleNegotiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!negotiatingBid) return;
    
    const amount = parseFloat(counterOffer);
    if (!amount || amount <= 0) {
      toast({ title: "Validation Error", description: "Please enter a valid counter offer amount.", variant: "destructive" });
      return;
    }

    negotiateBid(negotiatingBid.loadId, negotiatingBid.bid.id, amount, negotiationRemarks, negotiationValidTill, negotiationPriority);
    toast({
      title: "Counter Offer Sent",
      description: `Sent offer of ₹${amount.toLocaleString()} to ${negotiatingBid.bid.transporterName}.`,
      className: "bg-amber-600 text-white border-none"
    });

    setNegotiatingBid(null);
    setCounterOffer('');
    setNegotiationRemarks('');
    setNegotiationValidTill('2026-05-30');
    setNegotiationPriority('Medium');
  };

  const formatRevenue = (value: number) => {
    if (value >= 100000) {
      return `₹ ${(value / 100000).toFixed(1)} Lakhs`;
    }
    return `₹ ${value.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Loads</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor, manage, and dispatch active logistics loads in real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2 bg-white border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700">
            <Download size={16} /> Export DB
          </Button>
          <Link to="/create-load">
            <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md transition-all active:scale-95">
              <Plus size={16} /> New Load
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Loads', val: stats.total, color: 'border-l-blue-500', icon: BarChart3, bg: 'text-blue-500' },
          { label: 'Assigned Loads', val: stats.assigned, color: 'border-l-blue-600', icon: Truck, bg: 'text-blue-600' },
          { label: 'Completed Loads', val: stats.completed, color: 'border-l-gray-400', icon: CheckCircle2, bg: 'text-gray-500' },
          { label: 'Money Spend', val: formatRevenue(stats.revenue), color: 'border-l-green-600', icon: CircleDollarSign, bg: 'text-green-600 font-mono' },
        ].map((c, i) => (
          <Card key={i} className={`border-0 border-l-4 ${c.color} shadow-sm bg-white overflow-hidden`}>
            <CardContent className="p-4 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{c.label}</p>
                <h3 className={`text-base font-bold text-gray-800 ${c.bg}`}>{c.val}</h3>
              </div>
              <c.icon className={`w-5 h-5 opacity-30 ${c.bg}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className="border-0 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-50 p-5 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold text-gray-800">Dispatch Registry</CardTitle>
            <CardDescription className="text-xs text-gray-400">All registered freight logistics loads.</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <Input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search route, load, cargo..." 
                className="pl-9 w-full sm:w-[220px] bg-gray-50/50 border-gray-200 h-9 text-xs focus-visible:ring-green-500 shadow-none"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50/50 p-1 border rounded-lg">
              {['All', 'Open', 'Assigned', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                    statusFilter === tab 
                      ? 'bg-white text-gray-800 shadow-xs' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="font-bold text-gray-600">Load ID</TableHead>
                <TableHead className="font-bold text-gray-600">Route & Stops</TableHead>
                <TableHead className="font-bold text-gray-600">Tonnes</TableHead>
                <TableHead className="font-bold text-gray-600">Rate/Tonne</TableHead>
                <TableHead className="font-bold text-gray-600">Estimated Value</TableHead>
                <TableHead className="font-bold text-gray-600">Dispatch Date</TableHead>
                <TableHead className="font-bold text-gray-600">Status</TableHead>
                <TableHead className="font-bold text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredLoads.map((load, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95 }} 
                    transition={{ delay: i * 0.02 }}
                    key={load.id} 
                    className="group border-b border-gray-50 hover:bg-green-50/20 cursor-pointer transition-colors"
                    onClick={() => setSelectedLoadId(load.id)}
                  >
                    <TableCell className="font-bold text-sm text-green-700">
                      {load.bidId}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-800">{load.from}</span>
                        {load.stops && load.stops.length > 0 && load.stops.map((stop, idx) => (
                          <React.Fragment key={idx}>
                             <ArrowRight size={13} className="text-orange-400" />
                             <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{stop}</span>
                          </React.Fragment>
                        ))}
                        <ArrowRight size={13} className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-800">{load.to}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-gray-800 flex items-center gap-1"><Weight size={13}/> {load.tonnes} Tonnes</span>
                    </TableCell>
                    <TableCell className="font-bold text-sm text-gray-700">₹{load.ratePerTonne.toLocaleString('en-IN')}/T</TableCell>
                    <TableCell className="font-bold text-sm text-green-700">
                      ₹{load.totalFreight.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 font-medium">
                      <span className="flex items-center gap-1.5"><Calendar size={12} className="text-gray-400" /> {load.dispatchDate}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(load.status)}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-gray-100 rounded-full text-blue-600"
                          onClick={() => setSelectedLoadId(load.id)}
                        >
                          <Eye size={15} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-gray-100 rounded-full text-green-600"
                          onClick={() => startEdit(load)}
                        >
                          <Edit size={15} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-red-50 text-red-600 rounded-full"
                          onClick={() => setDeleteConfirmId(load.id)}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
                
                {filteredLoads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-gray-500 italic">
                      No matching loads found in the database.
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ULTRA PREMIUM RIGHT-SIDE DRAWER: Load Details & Top 7 Cheapest Bids */}
      <AnimatePresence>
        {selectedLoad && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLoadId(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs z-10"
            />
            
            {/* Drawer Container */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-[1250px] h-full bg-slate-50 shadow-2xl flex flex-col z-20 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">DISPATCH CONTROL</span>
                    <span className="text-xs font-mono text-slate-300">REF: {selectedLoad.bidId}</span>
                  </div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    Load Console: <span className="text-green-400 font-mono">{selectedLoad.id}</span>
                  </h2>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedLoadId(null)} className="h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50">
                    <X size={18} />
                  </Button>
                </div>
              </div>

              {/* Drawer Workspace */}
              <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
                
                {/* Left Side: Load Spec Sheet & Route Timeline */}
                <div className="w-full lg:w-[350px] bg-white border-r border-slate-200 p-6 flex flex-col gap-6">
                  
                  {/* Status Banner */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Operational Status</h3>
                    {selectedLoad.status === 'Assigned & Dispatched' ? (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                          <CheckCircle2 size={16} className="text-blue-600" />
                          LOAD ASSIGNED & DISPATCHED
                        </div>
                        <p className="text-[11px] text-blue-700">
                          Trip ID <span className="font-mono font-bold text-xs">{selectedLoad.tripId}</span> has been provisioned. Fleet is locked.
                        </p>
                      </div>
                    ) : selectedLoad.status === 'Negotiation In Progress' ? (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-1">
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                          <Clock size={16} className="text-amber-600 animate-pulse" />
                          NEGOTIATION IN PROGRESS
                        </div>
                        <p className="text-[11px] text-amber-700">
                          Counter offer of <span className="font-bold">₹{selectedLoad.negotiationDetails?.counterOffer.toLocaleString()}</span> has been sent. Priority: {selectedLoad.negotiationDetails?.priority}.
                        </p>
                      </div>
                    ) : selectedLoad.status === 'Awaiting New Bids' ? (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-1">
                        <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                          <AlertTriangle size={16} className="text-rose-600" />
                          AWAITING NEW BIDS
                        </div>
                        <p className="text-[11px] text-rose-700">All current bids were rejected. Awaiting new transporter rate cards.</p>
                      </div>
                    ) : selectedLoad.status === 'Completed' ? (
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-1">
                        <div className="flex items-center gap-2 text-gray-800 font-bold text-xs">
                          <CheckCircle2 size={16} className="text-gray-500" />
                          TRIP COMPLETED
                        </div>
                        <p className="text-[11px] text-gray-500">Trip has concluded. POD generated successfully.</p>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-1">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                          <Sparkles size={14} className="text-emerald-600 animate-spin" />
                          ACTIVE FREIGHT BIDDING
                        </div>
                        <p className="text-[11px] text-emerald-700">Currently taking competitive bidding quotes in real-time.</p>
                      </div>
                    )}
                  </div>

                  {/* Route Timeline */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Transit Route Timeline</h3>
                    <div className="relative pl-6 space-y-6">
                      {/* Vertical Connector Line */}
                      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-200 border-dashed border-l border-slate-300" />

                      {/* Origin */}
                      <div className="relative">
                        <span className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-[10px]">A</span>
                        <h4 className="text-xs font-bold text-slate-800">{selectedLoad.from}</h4>
                        <p className="text-[10px] text-slate-400">Loading Terminal</p>
                      </div>

                      {/* Stops */}
                      {selectedLoad.stops && selectedLoad.stops.map((stop, index) => (
                        <div key={index} className="relative">
                          <span className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-[10px]">{index + 1}</span>
                          <h4 className="text-xs font-bold text-slate-800">{stop}</h4>
                          <p className="text-[10px] text-orange-500 font-medium">Intermediate Stop</p>
                        </div>
                      ))}

                      {/* Destination */}
                      <div className="relative">
                        <span className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">B</span>
                        <h4 className="text-xs font-bold text-slate-800">{selectedLoad.to}</h4>
                        <p className="text-[10px] text-slate-400">Receiving Warehouse</p>
                      </div>
                    </div>
                  </div>

                  {/* Load Specifications Card */}
                  <Card className="border border-slate-100 shadow-none bg-slate-50/50">
                    <CardHeader className="p-4 border-b border-slate-100 bg-slate-50">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-400" /> SPECIFICATIONS
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Product Cargo:</span>
                        <span className="font-bold text-slate-800">{selectedLoad.product}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Payload Weight:</span>
                        <span className="font-bold text-slate-800">{selectedLoad.tonnes} Tonnes</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Target Freight / T:</span>
                        <span className="font-bold text-slate-800 font-mono">₹{selectedLoad.ratePerTonne}/T</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Dispatch Target:</span>
                        <span className="font-bold text-slate-800">{selectedLoad.dispatchDate}</span>
                      </div>
                      <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Target Total Freight:</span>
                        <span className="text-sm font-bold text-green-700 font-mono">₹{selectedLoad.totalFreight.toLocaleString('en-IN')}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assigned Transporter details */}
                  {selectedLoad.assignedTransporter && (
                    <Card className="border border-blue-200 shadow-none bg-blue-50/30 overflow-hidden">
                      <div className="p-3.5 bg-blue-100/50 border-b border-blue-100 text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <Award size={14} className="text-blue-600" /> CONTRACTED CARRIER
                      </div>
                      <CardContent className="p-4 space-y-2.5 text-xs text-blue-950">
                        <p className="font-bold text-sm text-blue-900">{selectedLoad.assignedTransporter.companyName}</p>
                        <div className="flex justify-between">
                          <span className="opacity-75">Owner:</span>
                          <span className="font-semibold">{selectedLoad.assignedTransporter.ownerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-75">Rating:</span>
                          <span className="font-semibold flex items-center gap-1"><Star size={11} className="fill-amber-400 text-amber-400" /> {selectedLoad.assignedTransporter.rating}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-75">Fleet Size:</span>
                          <span className="font-semibold">{selectedLoad.assignedTransporter.fleetSize} Heavy Commercials</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Export Options */}
                  <div className="mt-auto space-y-2">
                    <Button 
                      onClick={() => handleExportBidsComparison(selectedLoad)}
                      className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs h-9 justify-center gap-2 text-xs font-bold"
                    >
                      <FileSpreadsheet size={14} className="text-green-600" /> Export Comparison Sheet
                    </Button>
                  </div>
                </div>

                {/* Right Side: Bid Marketplace (Cheapest Bids) */}
                <div className="flex-1 p-6 flex flex-col gap-6">
                  
                  {/* Bids Control Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        Top 7 Competitive Bids <Badge className="bg-green-600 text-white font-mono">{filteredBids.length}</Badge>
                      </h3>
                      <p className="text-xs text-slate-400">Sort carrier quotes by bid amount in ascending or descending order.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <Input 
                          value={bidSearch} 
                          onChange={e => setBidSearch(e.target.value)} 
                          placeholder="Search transporters..." 
                          className="pl-8 bg-white border-slate-200 text-xs h-9 shadow-xs"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 bg-slate-100 p-1 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-1.5 px-2 text-slate-500 border-r border-slate-300">
                          <Filter size={14} />
                          <span className="text-xs font-bold uppercase tracking-wider">Filter</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {(['asc', 'desc'] as const).map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setBidSort(opt)}
                              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                                bidSort === opt 
                                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200' 
                                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                              }`}
                            >
                              {opt === 'asc' ? 'Low to High' : 'High to Low'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bids Table Card */}
                  <Card className="border border-slate-200/60 shadow-sm bg-white overflow-hidden flex-1 flex flex-col">
                    <div className="overflow-x-auto flex-1">
                      <Table className="w-full">
                        <TableHeader className="bg-slate-50 border-b">
                          <TableRow>
                            <TableHead className="font-bold text-slate-600 text-xs w-[60px] text-center">Rank</TableHead>
                            <TableHead className="font-bold text-slate-600 text-xs">Transporter</TableHead>
                            <TableHead className="font-bold text-slate-600 text-xs">Vehicle Type</TableHead>
                            <TableHead className="font-bold text-slate-600 text-xs">Bid Amount</TableHead>
                            <TableHead className="font-bold text-slate-600 text-xs">Rate / T</TableHead>
                            <TableHead className="font-bold text-slate-600 text-xs">Rating</TableHead>
                            <TableHead className="font-bold text-slate-600 text-xs">Verification</TableHead>
                            <TableHead className="font-bold text-slate-600 text-xs">Status</TableHead>
                            <TableHead className="font-bold text-slate-600 text-xs text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {filteredBids.map((bid, i) => (
                              <motion.tr 
                                layout
                                initial={{ opacity: 0, y: 12 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0 }} 
                                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                                key={bid.id} 
                                className={`border-b group hover:bg-slate-50/80 transition-colors ${
                                  bid.status === 'Approved' ? 'bg-green-50/20' : ''
                                }`}
                              >
                                {/* Rank */}
                                <TableCell className="text-center font-mono">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                                    bid.rank === 1 ? 'bg-amber-100 text-amber-800' :
                                    bid.rank === 2 ? 'bg-slate-200 text-slate-700' :
                                    bid.rank === 3 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {bid.rank}
                                  </span>
                                </TableCell>

                                {/* Transporter Profile */}
                                <TableCell className="font-bold text-slate-800 text-xs">
                                  <div className="flex flex-col">
                                    <span 
                                      onClick={() => setViewingTransporter(bid.transporterDetails)}
                                      className="hover:underline hover:text-green-700 cursor-pointer"
                                    >
                                      {bid.transporterName}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-medium">Exp: {bid.experienceYears} Years</span>
                                  </div>
                                </TableCell>

                                {/* Vehicle Type */}
                                <TableCell className="text-xs text-slate-600 font-medium">
                                  {bid.vehicleType}
                                </TableCell>

                                {/* Bid Amount */}
                                <TableCell className="font-bold text-green-700 font-mono text-xs">
                                  ₹{bid.bidAmount.toLocaleString('en-IN')}
                                </TableCell>

                                {/* Rate Per Tonne */}
                                <TableCell className="text-slate-600 font-mono text-xs">
                                  ₹{bid.pricePerTonne}/T
                                </TableCell>


                                {/* Rating */}
                                <TableCell>
                                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                    {bid.driverRating}
                                  </div>
                                </TableCell>

                                {/* Verification Status Badges */}
                                <TableCell>
                                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                                    {bid.verificationStatus.map((vStatus, idx) => (
                                      <span 
                                        key={idx} 
                                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                                          vStatus === 'Trusted Transporter' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                          vStatus === 'KYC Verified' ? 'bg-green-50 text-green-700 border border-green-100' :
                                          vStatus === 'Insurance Valid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-100 text-gray-600'
                                        }`}
                                      >
                                        {vStatus === 'KYC Verified' && <ShieldCheck size={9} />}
                                        {vStatus}
                                      </span>
                                    ))}
                                  </div>
                                </TableCell>

                                {/* Bid Status */}
                                <TableCell>
                                  {getBidStatusBadge(bid.status)}
                                </TableCell>

                                {/* Actions */}
                                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                                  {selectedLoad.status !== 'Assigned & Dispatched' && selectedLoad.status !== 'Completed' ? (
                                    <div className="flex items-center justify-end gap-1 select-none">
                                      <Button 
                                        onClick={() => handleApproveBid(selectedLoad.id, bid.id, bid.transporterName)}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white h-7 text-[10px] px-2.5 font-bold uppercase rounded shadow-xs"
                                      >
                                        Approve
                                      </Button>
                                      <Button 
                                        onClick={() => {
                                          setNegotiatingBid({ loadId: selectedLoad.id, bid });
                                          setCounterOffer(bid.bidAmount.toString());
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-[10px] px-2.5 font-bold uppercase border-slate-200 text-slate-700 bg-white"
                                      >
                                        Negotiate
                                      </Button>
                                      <Button 
                                        onClick={() => setRejectConfirmBid({ loadId: selectedLoad.id, bidId: bid.id, transporterName: bid.transporterName })}
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-red-500 rounded-full hover:bg-red-50"
                                      >
                                        <X size={13} />
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-bold uppercase italic tracking-wider">Locked</span>
                                  )}
                                </TableCell>
                              </motion.tr>
                            ))}
                            
                            {filteredBids.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={10} className="h-32 text-center text-slate-400 italic">
                                  No bids match your search query or filters.
                                </TableCell>
                              </TableRow>
                            )}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Edit Load */}
      <Dialog open={!!editingLoad} onOpenChange={(val) => !val && setEditingLoad(null)}>
        <DialogContent className="sm:max-w-[550px] border-0 rounded-2xl shadow-xl overflow-hidden bg-white p-0">
          <form onSubmit={handleEditSubmit}>
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  Edit Load: {editingLoad?.id}
                </DialogTitle>
                <DialogDescription className="text-xs text-green-700/80 font-medium mt-1">
                  Modify dynamic cargo parameters and status.
                </DialogDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setEditingLoad(null)} className="h-8 w-8 rounded-full">
                <X size={16} />
              </Button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">From Location</label>
                  <Input 
                    value={editForm.from} 
                    onChange={e => setEditForm(prev => ({ ...prev, from: e.target.value }))}
                    className="border-gray-200 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">To Location</label>
                  <Input 
                    value={editForm.to} 
                    onChange={e => setEditForm(prev => ({ ...prev, to: e.target.value }))}
                    className="border-gray-200 shadow-sm"
                  />
                </div>
              </div>

              {editForm.stops.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase block">Route Stops (Midpoints)</label>
                  {editForm.stops.map((stop, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs text-orange-600 font-semibold w-16">Stop {idx+1}:</span>
                      <Input 
                        value={stop} 
                        onChange={e => handleEditStopChange(idx, e.target.value)}
                        className="border-gray-200 shadow-sm"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 h-8 w-8"
                        onClick={() => {
                          const newStops = [...editForm.stops];
                          newStops.splice(idx, 1);
                          setEditForm(prev => ({ ...prev, stops: newStops }));
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-start">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditForm(prev => ({ ...prev, stops: [...prev.stops, ''] }))}
                  className="text-xs text-green-700 border-green-600/20 hover:bg-green-50"
                >
                  + Add Intermediate Stop
                </Button>
              </div>


              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Dispatch Date</label>
                <Input 
                  type="date"
                  value={editForm.dispatchDate}
                  onChange={e => setEditForm(prev => ({ ...prev, dispatchDate: e.target.value }))}
                  className="border-gray-200 shadow-sm"
                />
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Weight (Tonnes)</label>
                  <Input 
                    type="number"
                    value={editForm.tonnes}
                    onChange={e => setEditForm(prev => ({ ...prev, tonnes: parseFloat(e.target.value) || 0 }))}
                    className="border-gray-200 shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Rate per Tonne (INR)</label>
                  <Input 
                    type="number"
                    value={editForm.ratePerTonne}
                    onChange={e => setEditForm(prev => ({ ...prev, ratePerTonne: parseFloat(e.target.value) || 0 }))}
                    className="border-gray-200 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase block">Dispatch Status</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Open">Open</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Real-time freight calculation preview */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Updated Estimated Value</span>
                <span className="text-lg font-bold text-green-700 font-mono">
                  ₹ {(editForm.tonnes * editForm.ratePerTonne).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingLoad(null)} className="h-9 px-4 border-gray-200">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white h-9 px-4 shadow-sm">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(val) => !val && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[400px] border-0 rounded-2xl shadow-xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-2">
              Are you sure you want to permanently delete load <span className="font-bold text-red-600">{deleteConfirmId}</span>? This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="border-gray-200">
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NESTED MODAL: Carrier Profile Credentials Viewer */}
      <Dialog open={!!viewingTransporter} onOpenChange={(val) => !val && setViewingTransporter(null)}>
        <DialogContent className="sm:max-w-[450px] border-0 rounded-2xl shadow-2xl overflow-hidden bg-white p-0">
          {viewingTransporter && (
            <>
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">VERIFIED CARRIER</span>
                  <DialogTitle className="text-base font-bold tracking-tight">{viewingTransporter.companyName}</DialogTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setViewingTransporter(null)} className="h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
                  <X size={16} />
                </Button>
              </div>

              <div className="p-6 space-y-4 text-sm text-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Owner Name</p>
                    <p className="font-semibold text-slate-800">{viewingTransporter.ownerName}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Fleet Size</p>
                    <p className="font-semibold text-slate-800">{viewingTransporter.fleetSize} Active Trucks</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Trips Completed</p>
                    <p className="font-semibold text-slate-800">{viewingTransporter.completedTrips}+ Safe Trips</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Experience</p>
                    <p className="font-semibold text-slate-800">{viewingTransporter.experienceYears} Years Operational</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">KYC Verification</p>
                    <Badge className="bg-green-100 text-green-800 border-none font-bold text-[10px] px-2.5">
                      {viewingTransporter.kycStatus}
                    </Badge>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Insurance Validity</p>
                    <p className="font-semibold text-emerald-700 flex items-center gap-1 text-xs">
                      <ShieldCheck size={13} /> {viewingTransporter.insuranceValidity}
                    </p>
                  </div>
                </div>

                {viewingTransporter.remarks && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                      <MessageSquare size={11} /> Negotiation Comments
                    </p>
                    <p className="text-xs italic text-slate-600 mt-1">{viewingTransporter.remarks}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t flex justify-end">
                <Button onClick={() => setViewingTransporter(null)} className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-4">
                  Close Profile
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* NESTED MODAL: Freight Bid Negotiation Counter Offer */}
      <Dialog open={!!negotiatingBid} onOpenChange={(val) => !val && setNegotiatingBid(null)}>
        <DialogContent className="sm:max-w-[420px] border-0 rounded-2xl shadow-2xl overflow-hidden bg-white p-0">
          {negotiatingBid && (
            <form onSubmit={handleNegotiateSubmit}>
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 text-slate-900 border-b border-amber-100 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-800 border border-amber-500/30 px-2 py-0.5 rounded">NEGOTIATION CONSOLE</span>
                  <DialogTitle className="text-base font-bold tracking-tight">
                    Negotiate: {negotiatingBid.bid.transporterName}
                  </DialogTitle>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => setNegotiatingBid(null)} className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-900 hover:bg-amber-100/50">
                  <X size={16} />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-amber-50 border border-amber-100/80 rounded-xl p-3.5 space-y-2 text-xs text-amber-950">
                  <div className="flex justify-between">
                    <span>Current Carrier Bid:</span>
                    <span className="font-bold text-slate-700 font-mono">₹{negotiatingBid.bid.bidAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Target Rate:</span>
                    <span className="font-bold text-slate-700 font-mono">₹{selectedLoad?.totalFreight.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Coins size={13} className="text-slate-400" /> Counter Offer Amount (INR) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                    <Input 
                      type="number" 
                      value={counterOffer}
                      onChange={e => setCounterOffer(e.target.value)}
                      placeholder="Enter counter freight amount..." 
                      className="pl-7 border-slate-200 font-mono focus-visible:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Valid Till</label>
                    <Input 
                      type="date"
                      value={negotiationValidTill}
                      onChange={e => setNegotiationValidTill(e.target.value)}
                      className="border-slate-200 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Priority Level</label>
                    <select
                      value={negotiationPriority}
                      onChange={e => setNegotiationPriority(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <MessageSquare size={13} className="text-slate-400" /> Special Remarks / Instructions
                  </label>
                  <textarea 
                    value={negotiationRemarks}
                    onChange={e => setNegotiationRemarks(e.target.value)}
                    placeholder="Enter negotiation terms, free detention details, or trip remarks..." 
                    className="w-full min-h-[80px] p-3 rounded-md border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setNegotiatingBid(null)} className="h-9 px-4 border-slate-200">
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white h-9 px-4 shadow-sm font-bold uppercase text-xs tracking-wider">
                  Transmit Counter Offer
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Bid Rejection */}
      <Dialog open={!!rejectConfirmBid} onOpenChange={(val) => !val && setRejectConfirmBid(null)}>
        <DialogContent className="sm:max-w-[400px] border-0 rounded-2xl shadow-xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" /> Reject Bid
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-2">
              Are you sure you want to reject the bid from <span className="font-bold text-slate-800">{rejectConfirmBid?.transporterName}</span>? A notification will be dispatched to the carrier.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setRejectConfirmBid(null)} className="border-slate-200">
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={handleRejectBid}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
