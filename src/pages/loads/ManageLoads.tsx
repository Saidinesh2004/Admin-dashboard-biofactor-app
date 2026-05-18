import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Download, Plus, Eye, Edit, Trash2, ArrowRight,
  MapPin, Calendar, Weight, CircleDollarSign, Truck, CheckCircle2,
  Clock, X, BarChart3, TrendingUp, HelpCircle
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLoadStore, type Load } from '@/store/loadStore';
import { exportToExcel } from '@/utils/exportCsv';

export default function ManageLoads() {
  const { toast } = useToast();
  const { loads, addLoad, updateLoad, deleteLoad } = useLoadStore();
  
  // Filtering & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals / Drawers State
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [editingLoad, setEditingLoad] = useState<Load | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
    from: '',
    stops: [] as string[],
    to: '',
    product: '',
    tonnes: 0,
    ratePerTonne: 0,
    dispatchDate: '',
    status: 'Open' as 'Open' | 'Assigned' | 'Completed'
  });

  // Dynamic Search & Filter Logic
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

  // Dynamic KPI Card Summaries
  const stats = useMemo(() => {
    const total = loads.length;
    const open = loads.filter(l => l.status === 'Open').length;
    const assigned = loads.filter(l => l.status === 'Assigned').length;
    const completed = loads.filter(l => l.status === 'Completed').length;
    
    // Revenue is the sum of totalFreight for Completed & Assigned loads
    const revenue = loads
      .filter(l => l.status === 'Completed' || l.status === 'Assigned')
      .reduce((sum, l) => sum + (l.totalFreight || 0), 0);
      
    // Active vehicles is dynamically based on Assigned/Completed loads
    const activeVehicles = assigned * 2 + completed * 1 + 5;
    
    return { total, open, assigned, completed, revenue, activeVehicles };
  }, [loads]);

  const getStatusBadge = (status: Load['status']) => {
    switch (status) {
      case 'Open': 
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-3 py-1 font-semibold">Open</Badge>;
      case 'Assigned': 
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none px-3 py-1 font-semibold">Assigned</Badge>;
      case 'Completed': 
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-none px-3 py-1 font-semibold">Completed</Badge>;
      default: 
        return <Badge variant="outline" className="px-3 py-1 font-semibold">{status}</Badge>;
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Loads', val: stats.total, color: 'border-l-blue-500', icon: BarChart3, bg: 'text-blue-500' },
          { label: 'Open Loads', val: stats.open, color: 'border-l-emerald-500', icon: HelpCircle, bg: 'text-emerald-500' },
          { label: 'Assigned Loads', val: stats.assigned, color: 'border-l-blue-600', icon: Truck, bg: 'text-blue-600' },
          { label: 'Completed Loads', val: stats.completed, color: 'border-l-gray-400', icon: CheckCircle2, bg: 'text-gray-500' },
          { label: 'Active Vehicles', val: stats.activeVehicles, color: 'border-l-purple-500', icon: Truck, bg: 'text-purple-500' },
          { label: 'Total Revenue', val: formatRevenue(stats.revenue), color: 'border-l-green-600', icon: CircleDollarSign, bg: 'text-green-600' },
        ].map((stat, i) => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={i}>
            <Card className={`border-l-4 ${stat.color} shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow`}>
              <CardContent className="p-4 flex flex-col justify-between h-24">
                <div className="flex justify-between items-start">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                  <stat.icon size={16} className={`${stat.bg}`} />
                </div>
                <p className="text-xl font-bold mt-1 text-gray-900 tracking-tight">{stat.val}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <Card className="border border-gray-100 shadow-sm bg-white rounded-xl">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search Load ID, Route, Product, Status..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white border-gray-200 shadow-sm focus-visible:ring-green-500" 
              />
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2">
                 <Filter size={14} className="text-gray-400" />
                 <select 
                   value={statusFilter} 
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="text-sm border-gray-200 bg-white rounded-md shadow-sm p-2 focus:ring-green-500 text-gray-700 outline-none"
                 >
                   <option value="All">All Statuses</option>
                   <option value="Open">Open</option>
                   <option value="Assigned">Assigned</option>
                   <option value="Completed">Completed</option>
                 </select>
               </div>
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
                <TableHead className="font-bold text-gray-600">Cargo & Weight</TableHead>
                <TableHead className="font-bold text-gray-600">Base Rate</TableHead>
                <TableHead className="font-bold text-gray-600">Freight Value</TableHead>
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
                    onClick={() => setSelectedLoad(load)}
                  >
                    <TableCell className="font-bold text-sm text-green-700">
                      {load.id}
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
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">{load.product}</span>
                        <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1"><Weight size={10}/> {load.tonnes} Tonnes</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-sm text-gray-700">₹{load.ratePerTonne}/T</TableCell>
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
                          onClick={() => setSelectedLoad(load)}
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

      {/* Drawer / Modal for View Load Details */}
      <Dialog open={!!selectedLoad} onOpenChange={(val) => !val && setSelectedLoad(null)}>
        <DialogContent className="sm:max-w-[500px] border-0 rounded-2xl shadow-xl overflow-hidden bg-white p-0">
          {selectedLoad && (
            <>
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Load Overview: {selectedLoad.id}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-green-700/80 font-medium mt-1">
                    System Created: {new Date(selectedLoad.createdAt).toLocaleDateString()}
                  </DialogDescription>
                </div>
                {getStatusBadge(selectedLoad.status)}
              </div>
              
              <div className="p-6 space-y-6">
                {/* Visual Route Pipeline */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">Route Stops Pipeline</p>
                  <div className="flex flex-col gap-2 pl-6 relative">
                    <div className="absolute left-[9px] top-2 bottom-2 w-0.5 border-l border-dashed border-gray-300"></div>
                    
                    <div className="relative flex items-center gap-3">
                      <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-blue-500 border border-white"></div>
                      <span className="text-xs font-bold text-gray-800">Origin: <span className="text-blue-600 font-semibold">{selectedLoad.from}</span></span>
                    </div>
                    
                    {selectedLoad.stops && selectedLoad.stops.map((stop, idx) => (
                      <div key={idx} className="relative flex items-center gap-3 py-1">
                        <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-orange-400 border border-white"></div>
                        <span className="text-xs font-semibold text-gray-600">Midpoint: <span className="text-orange-600 font-semibold">{stop}</span></span>
                      </div>
                    ))}
                    
                    <div className="relative flex items-center gap-3">
                      <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-green-500 border border-white"></div>
                      <span className="text-xs font-bold text-gray-800">Destination: <span className="text-green-600 font-semibold">{selectedLoad.to}</span></span>
                    </div>
                  </div>
                </div>

                {/* Cargo Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                    <Weight size={18} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Product & Weight</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedLoad.product} ({selectedLoad.tonnes} T)</p>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                    <Calendar size={18} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Dispatch Date</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedLoad.dispatchDate}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                    <CircleDollarSign size={18} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Rate per Tonne</p>
                      <p className="text-sm font-semibold text-gray-800">₹ {selectedLoad.ratePerTonne.toLocaleString()}/T</p>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                    <TrendingUp size={18} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Reference ID</p>
                      <p className="text-sm font-semibold text-gray-800 font-mono text-xs">{selectedLoad.bidId}</p>
                    </div>
                  </div>
                </div>

                {/* Freight Value Highlight */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-green-800 uppercase">Total Freight Value</h4>
                    <p className="text-[10px] text-green-600/70 font-medium">Estimated payout for this load</p>
                  </div>
                  <div className="text-2xl font-bold text-green-700 font-mono">
                    ₹ {selectedLoad.totalFreight.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedLoad(null)} className="h-9 px-4 border-gray-200">
                  Close details
                </Button>
                <Button 
                  onClick={() => {
                    setSelectedLoad(null);
                    startEdit(selectedLoad);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white h-9 px-4"
                >
                  Edit Load
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Product Type</label>
                  <select
                    value={editForm.product}
                    onChange={e => setEditForm(prev => ({ ...prev, product: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Rice">Rice</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Oranges">Oranges</option>
                    <option value="Sugar">Sugar</option>
                    <option value="Cement">Cement</option>
                    <option value="Steel">Steel</option>
                    <option value="Chemicals">Chemicals</option>
                  </select>
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
                <span className="text-xs font-bold text-gray-500 uppercase">Updated Freight Value</span>
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
    </div>
  );
}
