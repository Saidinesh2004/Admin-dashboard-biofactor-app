import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Download, Plus, MoreHorizontal, Eye, Edit, Trash2, ArrowRight,
  MapPin, Calendar, Weight, CircleDollarSign, Truck, Star, CheckCircle, XCircle, MessagesSquare, X, BarChart3, Clock, TrendingDown
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportToExcel } from '@/utils/exportCsv';

type BidStatus = 'Pending' | 'Approved' | 'Rejected' | 'Negotiating' | 'Waiting Confirmation';

export interface Bid {
  id: string;
  rank: number;
  transporterName: string;
  bidAmount: number;
  pricePerTonne: number;
  eta: string;
  vehicleType: string;
  rating: number;
  status: BidStatus;
}

export interface Load {
  id: string;
  from: string;
  to: string;
  product: string;
  quantity: number;
  rate: number;
  date: string;
  vehicleType: string;
  status: 'Open' | 'Bidding' | 'Approved' | 'Assigned' | 'Completed' | 'Cancelled';
  bids: Bid[];
}

const mockBidsGenerator = (baseRate: number, qty: number): Bid[] => {
  const transporters = ['FastFreight', 'SafeWay Logistics', 'BlueDart Express', 'Agarwal Movers', 'VRL Logistics', 'Gati Express', 'TCI Freight'];
  return transporters.map((t) => {
    const variation = Math.floor(Math.random() * 300) - 150; 
    const pricePerTonne = baseRate + variation;
    const bidAmount = pricePerTonne * qty;
    return {
      id: `BID-${Math.floor(Math.random() * 10000)}`,
      rank: 0,
      transporterName: t,
      bidAmount,
      pricePerTonne,
      eta: `${Math.floor(Math.random() * 24 + 12)} hours`,
      vehicleType: '22-Tonne Open',
      rating: Number((Math.random() * 1 + 4).toFixed(1)), // 4.0 to 5.0
      status: 'Pending' as BidStatus,
    }
  }).sort((a, b) => a.bidAmount - b.bidAmount).map((b, i) => ({ ...b, rank: i + 1 }));
}

const INITIAL_LOADS: Load[] = [
  { id: 'LD-1001', from: 'Kolkata, WB', to: 'Patna, BR', product: 'Rice', quantity: 25, rate: 2200, date: '2026-05-18', vehicleType: '22-Tonne Open', status: 'Bidding', bids: mockBidsGenerator(2200, 25) },
  { id: 'LD-1002', from: 'Nagpur, MH', to: 'Hyderabad, TS', product: 'Oranges', quantity: 15, rate: 1800, date: '2026-05-19', vehicleType: '19-Tonne Closed', status: 'Open', bids: mockBidsGenerator(1800, 15) },
  { id: 'LD-1003', from: 'Jalandhar, PB', to: 'Delhi, DL', product: 'Wheat', quantity: 30, rate: 1200, date: '2026-05-17', vehicleType: '32-Tonne Open', status: 'Assigned', bids: mockBidsGenerator(1200, 30).map((b,i) => i===0 ? {...b, status: 'Approved'} : b) },
  { id: 'LD-1004', from: 'Mumbai, MH', to: 'Bangalore, KA', product: 'Steel', quantity: 40, rate: 3100, date: '2026-05-20', vehicleType: '40-Tonne Flatbed', status: 'Bidding', bids: mockBidsGenerator(3100, 40) },
  { id: 'LD-1005', from: 'Chennai, TN', to: 'Kochi, KL', product: 'Fertilizer', quantity: 20, rate: 1500, date: '2026-05-21', vehicleType: '22-Tonne Closed', status: 'Completed', bids: mockBidsGenerator(1500, 20).map((b,i) => i===0 ? {...b, status: 'Approved'} : b) },
];

export default function ManageLoads() {
  const { toast } = useToast();
  const [loads, setLoads] = useState<Load[]>(INITIAL_LOADS);
  
  // Filtering
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [productFilter, setProductFilter] = useState('All');

  // UI States
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [negotiateBid, setNegotiateBid] = useState<{loadId: string, bid: Bid} | null>(null);
  const [negotiationAmount, setNegotiationAmount] = useState('');

  // Derived State
  const filteredLoads = useMemo(() => {
    return loads.filter(l => {
      const matchesSearch = l.id.toLowerCase().includes(search.toLowerCase()) || l.from.toLowerCase().includes(search.toLowerCase()) || l.to.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
      const matchesProduct = productFilter === 'All' || l.product === productFilter;
      return matchesSearch && matchesStatus && matchesProduct;
    });
  }, [loads, search, statusFilter, productFilter]);

  const stats = useMemo(() => ({
    total: loads.length,
    open: loads.filter(l => l.status === 'Open').length,
    bidding: loads.filter(l => l.status === 'Bidding').length,
    assigned: loads.filter(l => l.status === 'Assigned').length,
    completed: loads.filter(l => l.status === 'Completed').length,
    activeBids: loads.reduce((acc, l) => acc + (l.status === 'Bidding' ? l.bids.length : 0), 0)
  }), [loads]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Open</Badge>;
      case 'Bidding': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none animate-pulse">Bidding</Badge>;
      case 'Approved': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Approved</Badge>;
      case 'Assigned': return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none">Assigned</Badge>;
      case 'Completed': return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBidStatusBadge = (status: BidStatus) => {
    switch (status) {
      case 'Pending': return <Badge className="bg-gray-100 text-gray-700 border-none">Pending</Badge>;
      case 'Approved': return <Badge className="bg-green-100 text-green-700 border-none">Approved</Badge>;
      case 'Rejected': return <Badge className="bg-red-100 text-red-700 border-none">Rejected</Badge>;
      case 'Negotiating': return <Badge className="bg-orange-100 text-orange-700 border-none">Negotiating</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleExport = () => {
    const data = filteredLoads.map(l => ({
      'Load ID': l.id,
      'From': l.from,
      'To': l.to,
      'Product': l.product,
      'Quantity (T)': l.quantity,
      'Base Rate': l.rate,
      'Dispatch Date': l.date,
      'Vehicle Type': l.vehicleType,
      'Status': l.status,
      'Lowest Bid Amount': l.bids.length ? l.bids[0].bidAmount : 'N/A',
      'Total Bids': l.bids.length
    }));
    exportToExcel(data, 'Loads_Export.xls');
    toast({ title: 'Export Successful', description: 'Loads data has been exported to Excel.' });
  };

  const handleApproveBid = (loadId: string, bidId: string) => {
    setLoads(prev => prev.map(l => {
      if (l.id === loadId) {
        return {
          ...l,
          status: 'Assigned',
          bids: l.bids.map(b => b.id === bidId ? { ...b, status: 'Approved' } : { ...b, status: 'Rejected' })
        };
      }
      return l;
    }));
    toast({ title: 'Bid Approved', description: `Load ${loadId} assigned to transporter.`, className: "bg-green-500 text-white border-none" });
    
    if (selectedLoad?.id === loadId) {
      setSelectedLoad(prev => prev ? ({
        ...prev,
        status: 'Assigned',
        bids: prev.bids.map(b => b.id === bidId ? { ...b, status: 'Approved' as BidStatus } : { ...b, status: 'Rejected' as BidStatus })
      }) : null);
    }
  };

  const handleRejectBid = (loadId: string, bidId: string) => {
    setLoads(prev => prev.map(l => {
      if (l.id === loadId) {
        return {
          ...l,
          bids: l.bids.map(b => b.id === bidId ? { ...b, status: 'Rejected' } : b)
        };
      }
      return l;
    }));
    toast({ title: 'Bid Rejected', description: 'Transporter has been notified.' });
    if (selectedLoad?.id === loadId) {
      setSelectedLoad(prev => prev ? ({
        ...prev,
        bids: prev.bids.map(b => b.id === bidId ? { ...b, status: 'Rejected' as BidStatus } : b)
      }) : null);
    }
  };

  const handleNegotiateSubmit = () => {
    if (!negotiateBid || !negotiationAmount) return;
    
    setLoads(prev => prev.map(l => {
      if (l.id === negotiateBid.loadId) {
        return {
          ...l,
          bids: l.bids.map(b => b.id === negotiateBid.bid.id ? { ...b, status: 'Negotiating' } : b)
        };
      }
      return l;
    }));
    toast({ title: 'Negotiation Sent', description: `Counter offer of ₹${negotiationAmount} sent.` });
    
    if (selectedLoad?.id === negotiateBid.loadId) {
      setSelectedLoad(prev => prev ? ({
        ...prev,
        bids: prev.bids.map(b => b.id === negotiateBid.bid.id ? { ...b, status: 'Negotiating' as BidStatus } : b)
      }) : null);
    }
    
    setNegotiateBid(null);
    setNegotiationAmount('');
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Loads</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor, manage, and approve transportation loads.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2 bg-white border-gray-200 shadow-sm hover:bg-gray-50">
            <Download size={16} /> Export
          </Button>
          <Link to="/create-load">
            <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md transition-all active:scale-95">
              <Plus size={16} /> New Load
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Loads', val: stats.total, color: 'border-l-blue-500' },
          { label: 'Open Loads', val: stats.open, color: 'border-l-gray-400' },
          { label: 'Active Bidding', val: stats.bidding, color: 'border-l-yellow-500' },
          { label: 'Assigned Trips', val: stats.assigned, color: 'border-l-indigo-500' },
          { label: 'Total Bids', val: stats.activeBids, color: 'border-l-orange-500' },
          { label: 'Completed', val: stats.completed, color: 'border-l-green-500' },
        ].map((stat, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={i}>
            <Card className={`border-l-4 ${stat.color} shadow-sm bg-white`}>
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 text-gray-900">{stat.val}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="border border-gray-100 shadow-lg bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search Load ID, Route, Product..." 
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
                   className="text-sm border-gray-200 rounded-md shadow-sm p-2 focus:ring-green-500"
                 >
                   <option value="All">All Status</option>
                   <option value="Open">Open</option>
                   <option value="Bidding">Bidding</option>
                   <option value="Assigned">Assigned</option>
                   <option value="Completed">Completed</option>
                 </select>
               </div>
               <div className="flex items-center gap-2">
                 <Filter size={14} className="text-gray-400" />
                 <select 
                   value={productFilter} 
                   onChange={(e) => setProductFilter(e.target.value)}
                   className="text-sm border-gray-200 rounded-md shadow-sm p-2 focus:ring-green-500"
                 >
                   <option value="All">All Products</option>
                   <option value="Rice">Rice</option>
                   <option value="Wheat">Wheat</option>
                   <option value="Oranges">Oranges</option>
                   <option value="Steel">Steel</option>
                   <option value="Fertilizer">Fertilizer</option>
                 </select>
               </div>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="font-bold text-gray-600">Load ID</TableHead>
                <TableHead className="font-bold text-gray-600">Route</TableHead>
                <TableHead className="font-bold text-gray-600">Product & Qty</TableHead>
                <TableHead className="font-bold text-gray-600">Base Rate</TableHead>
                <TableHead className="font-bold text-gray-600">Lowest Bid</TableHead>
                <TableHead className="font-bold text-gray-600">Status</TableHead>
                <TableHead className="font-bold text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredLoads.map((load, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}
                    key={load.id} 
                    onClick={() => setSelectedLoad(load)}
                    className="group border-b border-gray-50 hover:bg-green-50/50 cursor-pointer transition-colors"
                  >
                    <TableCell className="font-bold text-sm text-green-700">
                      <div className="flex items-center gap-2">
                        {load.id}
                        {load.status === 'Bidding' && <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{load.from}</span>
                        <ArrowRight size={14} className="text-gray-300" />
                        <span className="text-sm font-medium">{load.to}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1"><Calendar size={10} /> Dispatch: {load.date}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{load.product}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Weight size={10}/> {load.quantity} Tonnes</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-sm">₹{load.rate}/T</TableCell>
                    <TableCell>
                      {load.bids.length > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-green-700">₹{load.bids[0].bidAmount.toLocaleString()}</span>
                          <span className="text-[10px] text-gray-500">{load.bids.length} total bids</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No bids yet</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(load.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-gray-100 shadow-sm border border-gray-200 text-green-700 font-medium">
                        View Bids
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
                {filteredLoads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                      No loads found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Drawer for Top Bids */}
      <AnimatePresence>
        {selectedLoad && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedLoad(null)}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-full max-w-2xl bg-gray-50 shadow-2xl z-50 overflow-y-auto flex flex-col border-l"
            >
               <div className="p-6 bg-white border-b sticky top-0 z-10 flex items-center justify-between shadow-sm">
                 <div>
                   <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                     Load Details: {selectedLoad.id}
                     {getStatusBadge(selectedLoad.status)}
                   </h2>
                   <p className="text-sm text-gray-500 mt-1">Review top 7 cheapest bids for this load.</p>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => setSelectedLoad(null)} className="rounded-full hover:bg-gray-100"><X /></Button>
               </div>
               
               <div className="p-6 space-y-6 flex-1">
                 {/* Load Details Overview */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="shadow-none border border-gray-200">
                      <CardContent className="p-4">
                         <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12}/> Route</p>
                         <p className="font-semibold text-sm mt-1">{selectedLoad.from} <ArrowRight className="inline w-3 h-3 text-gray-400"/> {selectedLoad.to}</p>
                      </CardContent>
                    </Card>
                    <Card className="shadow-none border border-gray-200">
                      <CardContent className="p-4">
                         <p className="text-xs text-gray-500 flex items-center gap-1"><Weight size={12}/> Cargo</p>
                         <p className="font-semibold text-sm mt-1">{selectedLoad.product} ({selectedLoad.quantity} T)</p>
                      </CardContent>
                    </Card>
                    <Card className="shadow-none border border-gray-200">
                      <CardContent className="p-4">
                         <p className="text-xs text-gray-500 flex items-center gap-1"><Truck size={12}/> Vehicle</p>
                         <p className="font-semibold text-sm mt-1">{selectedLoad.vehicleType}</p>
                      </CardContent>
                    </Card>
                    <Card className="shadow-none border border-gray-200">
                      <CardContent className="p-4">
                         <p className="text-xs text-gray-500 flex items-center gap-1"><CircleDollarSign size={12}/> Base Rate</p>
                         <p className="font-semibold text-sm mt-1">₹{selectedLoad.rate}/T</p>
                      </CardContent>
                    </Card>
                 </div>

                 <div className="flex items-center justify-between mt-8 mb-4">
                   <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                     <TrendingDown className="w-5 h-5 text-green-600" />
                     Top Cheapest Bids
                   </h3>
                   <Badge variant="outline" className="text-xs text-gray-500">{selectedLoad.bids.length} total received</Badge>
                 </div>

                 {/* Bids List */}
                 <div className="space-y-4">
                   {selectedLoad.bids.length === 0 ? (
                     <div className="text-center p-8 bg-white rounded-xl border border-dashed border-gray-300">
                       <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                       <p className="text-gray-500 font-medium">No bids received yet.</p>
                       <p className="text-xs text-gray-400 mt-1">Transporters will be notified of this open load.</p>
                     </div>
                   ) : (
                     selectedLoad.bids.slice(0,7).map((bid) => (
                       <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={bid.id}>
                         <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 border-b border-gray-100 gap-4">
                              <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${bid.rank === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                  #{bid.rank}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">{bid.transporterName}</span>
                                    {getBidStatusBadge(bid.status)}
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/> {bid.rating}</span>
                                    <span className="flex items-center gap-1"><Truck className="w-3 h-3"/> {bid.vehicleType}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> ETA: {bid.eta}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-500 font-medium">Total Amount</span>
                                <div className="font-bold text-xl text-green-700 tracking-tight">₹{bid.bidAmount.toLocaleString()}</div>
                                <div className="text-xs text-gray-400">₹{bid.pricePerTonne}/Tonne</div>
                              </div>
                            </div>
                            
                            {selectedLoad.status !== 'Assigned' && selectedLoad.status !== 'Completed' && bid.status !== 'Rejected' && (
                              <div className="p-3 bg-white flex items-center justify-end gap-2 border-t border-gray-50">
                                <Button 
                                  variant="outline" size="sm" 
                                  onClick={() => handleRejectBid(selectedLoad.id, bid.id)}
                                  className="text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 h-8"
                                >
                                  Reject
                                </Button>
                                <Button 
                                  variant="outline" size="sm" 
                                  onClick={() => setNegotiateBid({ loadId: selectedLoad.id, bid })}
                                  className="text-orange-600 border-orange-100 hover:bg-orange-50 hover:text-orange-700 h-8"
                                >
                                  Negotiate
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApproveBid(selectedLoad.id, bid.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white h-8 shadow-sm"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" /> Approve Bid
                                </Button>
                              </div>
                            )}
                         </Card>
                       </motion.div>
                     ))
                   )}
                 </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Negotiation Dialog */}
      <Dialog open={!!negotiateBid} onOpenChange={(val) => !val && setNegotiateBid(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Negotiate Bid</DialogTitle>
            <DialogDescription>
              Submit a counter offer to {negotiateBid?.bid.transporterName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Bid Amount</label>
              <div className="text-lg font-bold text-gray-900">₹{negotiateBid?.bid.bidAmount.toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Counter Offer (₹)</label>
              <Input 
                type="number" 
                placeholder="Enter counter amount..." 
                value={negotiationAmount}
                onChange={(e) => setNegotiationAmount(e.target.value)}
                className="focus-visible:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Remarks (Optional)</label>
              <Input placeholder="e.g. Can you match ₹X?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNegotiateBid(null)}>Cancel</Button>
            <Button onClick={handleNegotiateSubmit} className="bg-orange-600 hover:bg-orange-700 text-white">Send Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
