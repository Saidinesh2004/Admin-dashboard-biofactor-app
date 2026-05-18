import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowRight, Download, Eye, RefreshCw, FileText, 
  CheckCircle, Clock, AlertTriangle, FileWarning, IndianRupee, FileCheck, X
} from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { exportToPDF } from '@/utils/exportPdf';
import { exportToCSV, exportToExcel } from '@/utils/exportCsv';

// Mock Data Types
type PodStatus = 'Pending' | 'Verified' | 'Review Needed' | 'Rejected' | 'Shortage Reported' | 'POD Missing';

interface PodRecord {
  id: string;
  route: string;
  transporter: string;
  receivedQty: number;
  deliveredQty: number;
  shortage: number;
  penaltyRate: number;
  penalty: number;
  status: PodStatus;
  dispatchDate: string;
  deliveryDate: string;
}

const initialPodQueue: PodRecord[] = [
  { id: 'LD-1003', route: 'Jalandhar → Delhi', transporter: 'Speedy Trucks', receivedQty: 30, deliveredQty: 29.5, shortage: 0.5, penaltyRate: 3000, penalty: 1500, status: 'Pending', dispatchDate: '2026-05-15', deliveryDate: '2026-05-18' },
  { id: 'LD-1005', route: 'Mumbai → Pune', transporter: 'Reliable Cargo', receivedQty: 20, deliveredQty: 20, shortage: 0, penaltyRate: 3000, penalty: 0, status: 'Verified', dispatchDate: '2026-05-16', deliveryDate: '2026-05-17' },
  { id: 'LD-1008', route: 'Chennai → Bangalore', transporter: 'SafeWay Logistics', receivedQty: 15, deliveredQty: 14.8, shortage: 0.2, penaltyRate: 3000, penalty: 600, status: 'Review Needed', dispatchDate: '2026-05-14', deliveryDate: '2026-05-16' },
  { id: 'LD-1012', route: 'Nagpur → Hyderabad', transporter: 'BlueDart Freight', receivedQty: 25, deliveredQty: 25, shortage: 0, penaltyRate: 3000, penalty: 0, status: 'Pending', dispatchDate: '2026-05-17', deliveryDate: '2026-05-18' },
  { id: 'LD-1015', route: 'Kolkata → Patna', transporter: 'Eastern Express', receivedQty: 40, deliveredQty: 39, shortage: 1, penaltyRate: 3000, penalty: 3000, status: 'Shortage Reported', dispatchDate: '2026-05-12', deliveryDate: '2026-05-16' },
];

export default function PODVerification() {
  const { toast } = useToast();
  const [queue, setQueue] = useState<PodRecord[]>(initialPodQueue);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [selectedPod, setSelectedPod] = useState<PodRecord | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Verification Form State
  const [verifyRemarks, setVerifyRemarks] = useState('');
  const [verifyPenalty, setVerifyPenalty] = useState(0);

  // Computed Metrics
  const filteredQueue = useMemo(() => {
    return queue.filter(item => 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.transporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.route.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [queue, searchTerm]);

  const metrics = useMemo(() => ({
    total: queue.length,
    pending: queue.filter(q => q.status === 'Pending').length,
    verified: queue.filter(q => q.status === 'Verified').length,
    reviewNeeded: queue.filter(q => ['Review Needed', 'Shortage Reported', 'Rejected'].includes(q.status)).length,
    shortageCases: queue.filter(q => q.shortage > 0).length,
    totalPenalty: queue.reduce((sum, q) => sum + q.penalty, 0)
  }), [queue]);

  const kpiCards = [
    { title: 'Total PODs', value: metrics.total, icon: FileText, bg: 'bg-blue-100', color: 'text-blue-600' },
    { title: 'Pending Verify', value: metrics.pending, icon: Clock, bg: 'bg-yellow-100', color: 'text-yellow-600' },
    { title: 'Verified', value: metrics.verified, icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600' },
    { title: 'Review Needed', value: metrics.reviewNeeded, icon: AlertTriangle, bg: 'bg-orange-100', color: 'text-orange-600' },
    { title: 'Shortage Cases', value: metrics.shortageCases, icon: FileWarning, bg: 'bg-red-100', color: 'text-red-600' },
    { title: 'Total Penalty', value: `₹ ${metrics.totalPenalty}`, icon: IndianRupee, bg: 'bg-teal-100', color: 'text-teal-600' },
  ];

  // Actions
  const handleDownloadPending = () => {
    const pendingList = queue.filter(q => q.status === 'Pending');
    const date = new Date().toISOString().split('T')[0];
    exportToCSV(pendingList, `POD_Pending_List_${date}.csv`);
    toast({ title: "Downloaded", description: "Pending list downloaded successfully." });
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(async () => {
      try {
        const date = new Date().toISOString().split('T')[0];
        await exportToPDF('pod-dashboard-container', `POD_Report_${date}.pdf`);
        toast({ title: "Success", description: "PDF Exported successfully.", className: "bg-green-500 text-white" });
      } catch (e) {
        toast({ title: "Error", description: "Failed to export PDF", variant: "destructive" });
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };

  const openViewModal = (pod: PodRecord) => {
    setSelectedPod(pod);
    setIsViewModalOpen(true);
  };

  const openVerifyModal = (pod: PodRecord) => {
    setSelectedPod(pod);
    setVerifyRemarks('');
    setVerifyPenalty(pod.penalty);
    setIsVerifyModalOpen(true);
  };

  const handleVerifySubmit = (status: PodStatus) => {
    if (!selectedPod) return;
    
    setQueue(prev => prev.map(p => {
      if (p.id === selectedPod.id) {
        return { ...p, status, penalty: verifyPenalty };
      }
      return p;
    }));
    
    setIsVerifyModalOpen(false);
    toast({
      title: status === 'Verified' ? "POD Verified" : "POD Rejected",
      description: status === 'Verified' ? "Payment eligibility released." : "Transporter notified for review.",
      className: status === 'Verified' ? "bg-green-500 text-white" : "bg-orange-500 text-white"
    });
  };

  return (
    <div className="space-y-6 pb-12" id="pod-dashboard-container">
      
      {/* PDF Header - Visible only during export */}
      <div className={cn("text-center mb-6 pb-6 border-b", isExporting ? "block" : "hidden")}>
         <h2 className="text-3xl font-bold text-gray-800">Biofactor POD Verification Report</h2>
         <p className="text-gray-500 mt-2">Delivery confirmations, shortages, and penalties</p>
      </div>

      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">POD Verification Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Verify delivered quantities, POD documents, and approve transporter payments.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => toast({ title: "Queue Refreshed", description: "Latest PODs loaded." })}>
            <RefreshCw size={16} /> Refresh
          </Button>
          <Button variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={handleDownloadPending}>
            <Download size={16} /> Pending List
          </Button>
          <Button disabled={isExporting} onClick={handleExportPDF} className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-sm">
            {isExporting ? <RefreshCw size={16} className="animate-spin" /> : <FileText size={16} />} 
            {isExporting ? "Generating PDF..." : "Export PDF"}
          </Button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((card, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("p-2 rounded-lg", card.bg)}>
                    <card.icon size={18} className={card.color} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                </div>
                <p className="text-xs text-gray-500 font-medium group-hover:text-gray-900 transition-colors">{card.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-md overflow-hidden bg-white rounded-xl">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search Load ID, Transporter, or Route..." 
                className="pl-10 bg-white border-gray-200 h-10 w-full rounded-lg shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
               <Badge className="bg-gray-100 text-gray-700 px-3 py-1 font-medium hover:bg-gray-200 transition-colors cursor-pointer text-xs rounded-md">Filter: All</Badge>
               <Badge className="bg-gray-100 text-gray-700 px-3 py-1 font-medium hover:bg-gray-200 transition-colors cursor-pointer text-xs rounded-md">Date: Last 7 Days</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b-gray-100">
                  <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4 pl-6">Load ID</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4">Route & Transporter</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4">Qty (Recv → Delv)</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4">Shortage / Penalty</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4">Status</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredQueue.map((item, idx) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "hover:bg-gray-50/80 transition-colors border-b border-gray-50 group",
                        item.shortage > 0 ? "bg-red-50/20" : ""
                      )}
                    >
                      <TableCell className="font-bold text-sm text-gray-900 pl-6">{item.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-gray-800">{item.route}</span>
                          <span className="text-[11px] text-gray-500 font-medium tracking-wide uppercase">{item.transporter}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{item.receivedQty}T</span>
                          <ArrowRight size={14} className="text-gray-400" />
                          <span className={cn("text-sm font-bold px-2 py-0.5 rounded", 
                            item.shortage > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                          )}>
                            {item.deliveredQty}T
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className={cn("text-sm font-bold", item.shortage > 0 ? "text-red-600" : "text-gray-500")}>
                            {item.shortage > 0 ? `${item.shortage}T Short` : 'No Shortage'}
                          </span>
                          {item.penalty > 0 && (
                            <span className="text-[11px] font-bold text-red-500 bg-red-50 inline-block px-1.5 py-0.5 rounded w-max">
                              Penalty: ₹{item.penalty}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "border-none px-2.5 py-1 text-xs font-semibold shadow-sm",
                          item.status === 'Verified' ? "bg-green-100 text-green-700" : 
                          item.status === 'Pending' ? "bg-yellow-100 text-yellow-800" : 
                          "bg-red-100 text-red-700"
                        )}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" onClick={() => openViewModal(item)} className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium">
                            <Eye size={14} className="mr-1.5" /> View POD
                          </Button>
                          <Button 
                            size="sm" 
                            disabled={item.status === 'Verified'}
                            onClick={() => openVerifyModal(item)}
                            className={cn("h-8 shadow-sm transition-all", 
                              item.status === 'Verified' ? "bg-gray-100 text-gray-400" : "bg-green-600 hover:bg-green-700 text-white"
                            )}
                          >
                            <FileCheck size={14} className="mr-1.5" /> Verify
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {filteredQueue.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                        No PODs found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* VIEW POD MODAL */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl bg-white p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
          <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="text-blue-400" /> POD Document Details
              </h2>
              <p className="text-gray-400 text-sm mt-1">Reviewing delivery proof for {selectedPod?.id}</p>
            </div>
            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-sm px-3 py-1">{selectedPod?.status}</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-gray-50">
            {/* Left Sidebar - Details */}
            <div className="col-span-1 border-r border-gray-200 bg-white p-6 space-y-6">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Load Information</p>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-sm text-gray-600">Route</span><span className="text-sm font-semibold text-gray-900">{selectedPod?.route}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-gray-600">Transporter</span><span className="text-sm font-semibold text-gray-900">{selectedPod?.transporter}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-gray-600">Dispatch</span><span className="text-sm font-semibold text-gray-900">{selectedPod?.dispatchDate}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-gray-600">Delivery</span><span className="text-sm font-semibold text-gray-900">{selectedPod?.deliveryDate}</span></div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Quantity Analysis</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Received:</span>
                  <span className="text-sm font-bold bg-white px-2 py-1 rounded shadow-sm">{selectedPod?.receivedQty}T</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Delivered:</span>
                  <span className="text-sm font-bold bg-white px-2 py-1 rounded shadow-sm text-green-600">{selectedPod?.deliveredQty}T</span>
                </div>
              </div>

              {selectedPod?.shortage ? (
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <div className="flex items-center gap-2 text-red-700 font-bold mb-1">
                    <AlertTriangle size={16} /> Shortage Detected
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-red-600/80">Missing Qty:</span>
                    <span className="text-sm font-bold text-red-700">{selectedPod.shortage}T</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-red-600/80">Penalty:</span>
                    <span className="text-sm font-bold text-red-700">₹{selectedPod.penalty}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center gap-2 text-green-700">
                  <CheckCircle size={18} /> <span className="text-sm font-bold">100% Delivery Success</span>
                </div>
              )}
            </div>

            {/* Right Side - Documents */}
            <div className="col-span-2 p-6 h-[500px] overflow-y-auto">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                Uploaded Documents (3)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Dealer Signature & Stamp', status: 'Verified' },
                  { name: 'Unloading Photo', status: 'Verified' },
                  { name: 'Weighbridge Slip', status: 'Pending Review' }
                ].map((doc, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl bg-white overflow-hidden group cursor-pointer hover:border-blue-300 transition-colors">
                    <div className="h-32 bg-gray-100 flex items-center justify-center relative">
                       <FileText size={40} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                       <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye size={24} className="text-white" />
                       </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-gray-900 truncate">{doc.name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{doc.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* VERIFY POD MODAL */}
      <Dialog open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl shadow-xl border-0 p-0 overflow-hidden">
          <div className="bg-blue-600 p-6 text-white text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20"><FileCheck size={80} /></div>
             <h2 className="text-2xl font-bold relative z-10">Verify Delivery</h2>
             <p className="text-blue-100 text-sm mt-1 relative z-10">{selectedPod?.id} - {selectedPod?.route}</p>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Shortage</p>
                <p className={cn("text-xl font-black mt-1", selectedPod?.shortage ? "text-red-600" : "text-green-600")}>
                  {selectedPod?.shortage}T
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Calculated Penalty</p>
                <p className="text-xl font-black text-gray-900 mt-1">₹{selectedPod?.penalty}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Adjust Penalty Amount (₹)</label>
                <Input 
                  type="number" 
                  value={verifyPenalty} 
                  onChange={(e) => setVerifyPenalty(Number(e.target.value))}
                  className="bg-gray-50 font-bold"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Verification Remarks</label>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                  placeholder="Add notes about shortage, approval, or reasons for rejection..."
                  value={verifyRemarks}
                  onChange={(e) => setVerifyRemarks(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
            <Button 
              className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200"
              onClick={() => handleVerifySubmit('Rejected')}
            >
              Reject & Request Review
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md"
              onClick={() => handleVerifySubmit('Verified')}
            >
              Approve POD
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
