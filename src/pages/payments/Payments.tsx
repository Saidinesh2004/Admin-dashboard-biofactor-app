import React, { useState, useMemo, useEffect } from 'react';
import { 
  CreditCard, ArrowUpRight, Clock, CheckCircle2, Search, Filter, 
  MoreVertical, ShieldCheck, Download, Plus, Receipt, FileText, 
  Coins, Scale, AlertTriangle, ArrowRight, MapPin, Calendar, 
  User, Building2, TrendingUp, BarChart3, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useLoadStore } from '@/store/loadStore';
import { usePaymentStore, type PaymentEntry } from '@/store/paymentStore';
import { useTransporterStore } from '@/store/transporterStore';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Payments() {
  const { toast } = useToast();
  const { loads } = useLoadStore();
  const { payments, addPayment, releasePayment, updatePaymentStatus, syncPaymentsFromLoads } = usePaymentStore();
  const { addNotification } = useTransporterStore();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<PaymentEntry | null>(null);
  const [releasingPayment, setReleasingPayment] = useState<PaymentEntry | null>(null);

  // New Payout Form state
  const [selectedLoadId, setSelectedLoadId] = useState('');
  const [extraCharges, setExtraCharges] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'UPI' | 'RTGS' | 'NEFT'>('Bank Transfer');

  // Auto-sync completed loads on page mount to ensure all final transactions appear instantly!
  useEffect(() => {
    syncPaymentsFromLoads();
  }, [loads]);

  // Dynamic calculation of loads eligible for manual payout creation
  const eligibleLoads = useMemo(() => {
    return loads.filter(l => l.status === 'Completed' || l.status === 'Assigned & Dispatched');
  }, [loads]);

  const selectedLoadDetail = useMemo(() => {
    return eligibleLoads.find(l => l.id === selectedLoadId);
  }, [selectedLoadId, eligibleLoads]);

  // Form field calculations
  const calculatedPayable = useMemo(() => {
    if (!selectedLoadDetail) return { base: 0, penalty: 0, tax: 0, final: 0 };
    const base = selectedLoadDetail.totalFreight || 0;
    const penalty = selectedLoadDetail.tonnes > 25 ? 2000 : 0;
    const tax = Math.round(base * 0.05); // 5% GST
    const extra = parseFloat(extraCharges) || 0;
    const final = base + tax + extra - penalty;
    return { base, penalty, tax, final };
  }, [selectedLoadDetail, extraCharges]);

  // Dynamic KPI Cards Computations
  const stats = useMemo(() => {
    const totalRevenue = payments.reduce((sum, p) => sum + p.finalAmount, 0);
    const outstanding = payments
      .filter(p => p.status !== 'Released' && p.status !== 'Completed')
      .reduce((sum, p) => sum + p.finalAmount, 0);
    const paidThisMonth = payments
      .filter(p => p.status === 'Released' || p.status === 'Completed')
      .reduce((sum, p) => sum + p.finalAmount, 0);
    const inReview = payments
      .filter(p => p.status === 'Under Review' || p.status === 'Processing')
      .reduce((sum, p) => sum + p.finalAmount, 0);
    const pendingCount = payments.filter(p => p.status === 'Pending').length;
    const completedCount = payments.filter(p => p.status === 'Released').length;

    return { totalRevenue, outstanding, paidThisMonth, inReview, pendingCount, completedCount };
  }, [payments]);

  // Filter and search
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = 
        p.paymentId.toLowerCase().includes(search.toLowerCase()) ||
        p.loadId.toLowerCase().includes(search.toLowerCase()) ||
        p.transporter.toLowerCase().includes(search.toLowerCase()) ||
        p.invoiceId.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  const handleCreatePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoadId) {
      toast({ title: "Form Error", description: "Please select an active completed load.", variant: "destructive" });
      return;
    }

    const loadObj = eligibleLoads.find(l => l.id === selectedLoadId)!;
    addPayment({
      loadId: loadObj.id,
      transporter: loadObj.assignedTransporter?.companyName || 'Delhi Roadlines',
      amount: calculatedPayable.base,
      penalty: calculatedPayable.penalty,
      tax: calculatedPayable.tax,
      extraCharges: parseFloat(extraCharges) || 0,
      finalAmount: calculatedPayable.final,
      status: 'Pending',
      paymentMethod
    });

    toast({
      title: "Payout Provisioned!",
      description: `New invoice INV generated for ${loadObj.id}.`,
      className: "bg-green-600 text-white font-semibold border-none"
    });

    setIsPayoutModalOpen(false);
    setSelectedLoadId('');
    setExtraCharges('0');
  };

  const handleReleaseConfirm = () => {
    if (!releasingPayment) return;
    releasePayment(releasingPayment.paymentId);
    
    // Dispatch instant transporter alert
    addNotification(
      releasingPayment.loadId,
      'Assignment',
      `Payment released! Payout of ₹${releasingPayment.finalAmount.toLocaleString('en-IN')} has been settled via ${releasingPayment.paymentMethod}.`
    );

    toast({
      title: "Settlement Confirmed",
      description: `Funds released for transaction ID ${releasingPayment.paymentId}.`,
      className: "bg-green-600 text-white border-none font-semibold shadow-md"
    });
    setReleasingPayment(null);
  };

  const triggerMockDownload = (type: string, id: string) => {
    toast({
      title: "Document Compiled",
      description: `Downloading ${type} for ID: ${id} successfully completed.`,
      className: "bg-blue-600 text-white font-bold border-none"
    });
  };

  const getStatusBadge = (status: PaymentEntry['status']) => {
    switch (status) {
      case 'Released':
      case 'Completed':
        return <Badge className="bg-emerald-100 text-emerald-800 border-none px-2.5 py-1 font-bold">Released</Badge>;
      case 'Pending':
        return <Badge className="bg-amber-100 text-amber-800 border-none px-2.5 py-1 font-bold animate-pulse">Pending</Badge>;
      case 'Under Review':
        return <Badge className="bg-blue-100 text-blue-800 border-none px-2.5 py-1 font-bold">In Review</Badge>;
      case 'Processing':
        return <Badge className="bg-violet-100 text-violet-800 border-none px-2.5 py-1 font-bold">Processing</Badge>;
      default:
        return <Badge variant="outline" className="px-2.5 py-1 font-bold">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payments & Settlements</h1>
          <p className="text-sm text-gray-500 mt-1">Manage transporter billing pipelines, taxes, and instant NEFT/RTGS audits.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            onClick={() => setIsHistoryOpen(true)}
            className="gap-2 bg-white border-slate-200 text-slate-700 shadow-xs hover:bg-slate-50 font-semibold"
          >
            <BarChart3 size={15} /> Payment Analytics
          </Button>
          <Button 
            onClick={() => setIsPayoutModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white gap-2 shadow-md transition-all active:scale-95 font-semibold"
          >
            <Plus size={15} /> New Payout
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Outstanding */}
        <Card className="border-0 shadow-xs bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10">
            <CreditCard size={150} />
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Outstanding</p>
                <h3 className="text-3xl font-extrabold font-mono text-emerald-400">₹{stats.outstanding.toLocaleString('en-IN')}</h3>
              </div>
              <div className="p-2.5 bg-white/10 rounded-xl text-white">
                <CreditCard size={20} />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
              <span className="text-slate-400 font-medium">Pending Payouts:</span>
              <span className="font-bold font-mono text-emerald-400">{stats.pendingCount} Bills</span>
            </div>
          </CardContent>
        </Card>

        {/* Paid This Month */}
        <Card className="border-0 shadow-xs bg-white overflow-hidden relative">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid / Released (Month)</p>
                <h3 className="text-3xl font-extrabold font-mono text-slate-900">₹{stats.paidThisMonth.toLocaleString('en-IN')}</h3>
              </div>
              <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span className="text-slate-400 font-medium">Completed Trips Paid:</span>
              <span className="font-bold text-green-600 flex items-center gap-1">
                <TrendingUp size={12} /> {stats.completedCount} Transactions
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Under Review */}
        <Card className="border-0 shadow-xs bg-white overflow-hidden relative">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Under Settlement Review</p>
                <h3 className="text-3xl font-extrabold font-mono text-slate-900">₹{stats.inReview.toLocaleString('en-IN')}</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Clock size={20} />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span className="text-slate-400 font-medium">Auto-deducted Penalties:</span>
              <span className="font-bold text-amber-600">Active GST Audit (5%)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table Container */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Settlement Ledger</CardTitle>
              <CardDescription className="text-xs text-slate-400">Ledger automatically syncs final freight values from completed loads.</CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by ID, Load, Carrier..." 
                  className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 w-[200px]" 
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="flex h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-none outline-none focus:ring-1 focus:ring-primary text-slate-600"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Released">Released</option>
                <option value="Under Review">Under Review</option>
                <option value="Processing">Processing</option>
              </select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-slate-500 uppercase text-[10px] py-3.5 pl-6">Ledger ID</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase text-[10px]">Load Reference</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase text-[10px]">Settlement Date</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase text-[10px]">Transporter</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase text-[10px]">Base Freight</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase text-[10px]">Penalty</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase text-[10px]">Final Settled</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase text-[10px]">Status</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase text-[10px] text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-slate-400 italic text-xs">
                      No matching records found in ledger.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((tx) => (
                    <TableRow key={tx.paymentId} className="hover:bg-slate-50/40">
                      <TableCell className="font-bold text-xs pl-6 font-mono text-slate-700">{tx.paymentId}</TableCell>
                      <TableCell className="text-xs font-mono font-bold text-primary">{tx.loadId}</TableCell>
                      <TableCell className="text-xs text-slate-500">{tx.createdAt}</TableCell>
                      <TableCell className="font-semibold text-xs text-slate-800">{tx.transporter}</TableCell>
                      <TableCell className="font-bold text-xs font-mono text-slate-600">₹{tx.amount.toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-xs font-mono text-rose-600">-₹{tx.penalty.toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-xs font-mono text-slate-900">₹{tx.finalAmount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className="text-right pr-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-1 select-none">
                          <Button 
                            onClick={() => setViewingInvoice(tx)}
                            size="sm"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 h-7 text-[10px] px-2.5 font-bold uppercase rounded"
                          >
                            Invoice
                          </Button>
                          {tx.status !== 'Released' && tx.status !== 'Completed' && (
                            <Button 
                              onClick={() => setReleasingPayment(tx)}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-[10px] px-2.5 font-bold uppercase rounded shadow-xs"
                            >
                              Release
                            </Button>
                          )}
                          <Button 
                            onClick={() => triggerMockDownload('Receipt', tx.paymentId)}
                            variant="ghost"
                            size="icon" 
                            className="h-7 w-7 text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                          >
                            <Download size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL 1: Create Payout Form Dialog */}
      <Dialog open={isPayoutModalOpen} onOpenChange={setIsPayoutModalOpen}>
        <DialogContent className="sm:max-w-[480px] border-0 rounded-2xl shadow-xl bg-white p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-slate-900 text-white">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Coins size={18} className="text-emerald-400" /> New Settlement Payout
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              Select completed transporter dispatches to automatically calculate billing rates and taxes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePayoutSubmit} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Select Active Load ID</label>
              <select
                value={selectedLoadId}
                onChange={e => setSelectedLoadId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Choose Completed/Dispatched Load --</option>
                {eligibleLoads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.id} - {l.product} ({l.from} → {l.to})
                  </option>
                ))}
              </select>
            </div>

            {selectedLoadDetail && (
              <div className="bg-slate-50 border rounded-xl p-4.5 space-y-3.5 text-xs text-slate-700">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-400 font-medium">Assigned Transporter:</span>
                  <span className="font-bold text-slate-900">{selectedLoadDetail.assignedTransporter?.companyName || 'Delhi Roadlines'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Approved Base Freight:</span>
                  <span className="font-mono font-semibold">₹{calculatedPayable.base.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span className="flex items-center gap-1">Delay Penalty (Auto): <AlertTriangle size={11} /></span>
                  <span className="font-mono font-bold">-₹{calculatedPayable.penalty.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax (5%):</span>
                  <span className="font-mono">₹{calculatedPayable.tax.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Extra Charges (INR)</label>
                <Input 
                  type="number"
                  value={extraCharges}
                  onChange={e => setExtraCharges(e.target.value)}
                  placeholder="Enter extra loading costs..."
                  className="border-slate-200 font-mono text-sm h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Settlement Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="RTGS">RTGS</option>
                  <option value="NEFT">NEFT</option>
                </select>
              </div>
            </div>

            {selectedLoadDetail && (
              <div className="pt-2 border-t flex justify-between items-center bg-slate-900/5 p-3 rounded-lg">
                <span className="text-xs font-bold text-slate-800">Final Payable Amount:</span>
                <span className="text-lg font-extrabold font-mono text-primary">₹{calculatedPayable.final.toLocaleString('en-IN')}</span>
              </div>
            )}

            <DialogFooter className="pt-4 border-t flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsPayoutModalOpen(false)} className="border-slate-200 h-10">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary-hover text-white h-10 font-bold px-4 uppercase text-xs tracking-wider shadow-sm">
                Provision Payout Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: View Dynamic Invoice Modal */}
      <Dialog open={!!viewingInvoice} onOpenChange={(val) => !val && setViewingInvoice(null)}>
        <DialogContent className="sm:max-w-[550px] border-0 rounded-2xl shadow-xl bg-white p-0 overflow-hidden font-sans">
          {viewingInvoice && (
            <div className="flex flex-col">
              
              {/* Invoice Header */}
              <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="text-emerald-400" size={18} />
                    <span className="text-sm font-bold tracking-wider text-slate-300">BIOFACTOR INVOICING</span>
                  </div>
                  <h3 className="text-xl font-bold font-mono">Invoice: {viewingInvoice.invoiceId}</h3>
                  <p className="text-[10px] text-slate-400">Date: {viewingInvoice.createdAt}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest font-mono">
                    {viewingInvoice.status}
                  </span>
                  <p className="text-[10px] text-slate-400">Load Ref: {viewingInvoice.loadId}</p>
                </div>
              </div>

              {/* Invoice Specs */}
              <div className="p-6 space-y-6">
                
                {/* Transporter Details */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Carrier Account</span>
                    <p className="text-xs font-bold text-slate-800">{viewingInvoice.transporter}</p>
                    <p className="text-[10px] text-slate-500">Verified KYC Transport Partner</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Payment Mode</span>
                    <p className="text-xs font-bold text-slate-800 font-mono">{viewingInvoice.paymentMethod}</p>
                    <p className="text-[10px] text-slate-500">Scheduled Settlement</p>
                  </div>
                </div>

                {/* Billing details */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Billing Breakdown</span>
                  <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                    <div className="grid grid-cols-3 bg-slate-50 p-2.5 font-bold border-b text-slate-500 uppercase tracking-wider text-[9px]">
                      <span>Description</span>
                      <span className="text-center">Rate / Details</span>
                      <span className="text-right">Total Amount</span>
                    </div>
                    <div className="p-3 space-y-3">
                      <div className="grid grid-cols-3">
                        <span className="font-semibold text-slate-800">Approved Base Freight</span>
                        <span className="text-center text-slate-500 font-mono">Base Bid Value</span>
                        <span className="text-right font-semibold font-mono text-slate-800">₹{viewingInvoice.amount.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-3 text-rose-600">
                        <span className="font-semibold">Shortage Delay Penalty</span>
                        <span className="text-center font-mono">Auto Deducted</span>
                        <span className="text-right font-bold font-mono">-₹{viewingInvoice.penalty.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-semibold text-slate-800">GST (5%)</span>
                        <span className="text-center text-slate-500 font-mono">CGST/SGST</span>
                        <span className="text-right font-semibold font-mono text-slate-800">₹{viewingInvoice.tax.toLocaleString()}</span>
                      </div>
                      {viewingInvoice.extraCharges > 0 && (
                        <div className="grid grid-cols-3">
                          <span className="font-semibold text-slate-800">Extra Loading/Detention</span>
                          <span className="text-center text-slate-500 font-mono">Manual Provision</span>
                          <span className="text-right font-semibold font-mono text-slate-800">₹{viewingInvoice.extraCharges.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Final payable */}
                <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Final Payable Amount</span>
                  <span className="text-xl font-black font-mono text-primary">₹{viewingInvoice.finalAmount.toLocaleString('en-IN')}</span>
                </div>

              </div>

              {/* Invoice actions */}
              <div className="p-4 bg-slate-100 border-t flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewingInvoice(null)} className="h-9 px-4 border-slate-200">
                  Close
                </Button>
                <Button 
                  onClick={() => triggerMockDownload('Invoice PDF', viewingInvoice.invoiceId)}
                  className="bg-primary hover:bg-primary-hover text-white h-9 px-4 shadow-sm font-bold uppercase text-xs tracking-wider flex items-center gap-1.5"
                >
                  <Download size={14} /> Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Release Payment Confirmation */}
      <Dialog open={!!releasingPayment} onOpenChange={(val) => !val && setReleasingPayment(null)}>
        <DialogContent className="sm:max-w-[400px] border-0 rounded-2xl shadow-xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-emerald-500 animate-pulse" /> Release Transport Payout
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-2">
              Are you sure you want to release the final settled amount of <span className="font-extrabold text-slate-800">₹{releasingPayment?.finalAmount.toLocaleString()}</span> to <span className="font-extrabold text-slate-800">{releasingPayment?.transporter}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 text-slate-700">
            <p><span className="text-slate-400 font-medium">Transaction ID:</span> <span className="font-mono font-bold">{releasingPayment?.paymentId}</span></p>
            <p><span className="text-slate-400 font-medium">Settlement Mode:</span> <span className="font-bold text-slate-900">{releasingPayment?.paymentMethod}</span></p>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setReleasingPayment(null)} className="border-slate-200">
              Cancel
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={handleReleaseConfirm}
            >
              Confirm Settlement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: Payment History & Finance Analytics Portal */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-[700px] border-0 rounded-2xl shadow-xl bg-white p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-slate-900 text-white flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" /> Finance Analytics Portal
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-1">
                Transporter revenue shares and monthly payout dispatch volume statistics.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
            
            {/* Visual Graph: CSS-Based Bars */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Settlements Outflow (INR)</h4>
              <div className="bg-slate-50 border rounded-xl p-6 flex justify-around items-end h-[160px] relative">
                
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-slate-200" />
                <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-slate-200" />
                <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-slate-200" />

                <div className="flex flex-col items-center gap-1.5 z-10 w-12">
                  <span className="text-[10px] font-bold text-slate-500 font-mono">2.8L</span>
                  <div className="w-6 bg-slate-300 rounded-t-md hover:bg-slate-400 transition-all h-[50px]" />
                  <span className="text-[10px] font-semibold text-slate-400">Feb</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 z-10 w-12">
                  <span className="text-[10px] font-bold text-slate-500 font-mono">4.2L</span>
                  <div className="w-6 bg-slate-300 rounded-t-md hover:bg-slate-400 transition-all h-[75px]" />
                  <span className="text-[10px] font-semibold text-slate-400">Mar</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 z-10 w-12">
                  <span className="text-[10px] font-bold text-slate-500 font-mono">5.9L</span>
                  <div className="w-6 bg-slate-300 rounded-t-md hover:bg-slate-400 transition-all h-[100px]" />
                  <span className="text-[10px] font-semibold text-slate-400">Apr</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 z-10 w-12">
                  <span className="text-[10px] font-bold text-slate-800 font-mono">{((stats.paidThisMonth + stats.outstanding) / 100000).toFixed(1)}L</span>
                  <div className="w-6 bg-primary rounded-t-md hover:bg-primary/95 transition-all h-[125px] shadow-2xs" />
                  <span className="text-[10px] font-bold text-slate-800">May (Act)</span>
                </div>
              </div>
            </div>

            {/* Carrier Revenue Share Comparisons */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transporter Allocation Volume Compare</h4>
              <div className="border rounded-xl p-4.5 space-y-4">
                
                {/* Transporter 1 */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>Delhi Roadlines</span>
                    <span className="font-mono">48% Share</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '48%' }} />
                  </div>
                </div>

                {/* Transporter 2 */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>SafeWay Express</span>
                    <span className="font-mono">32% Share</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '32%' }} />
                  </div>
                </div>

                {/* Transporter 3 */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>FastFreight Solutions</span>
                    <span className="font-mono">20% Share</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400" style={{ width: '20%' }} />
                  </div>
                </div>

              </div>
            </div>

          </div>

          <div className="p-4 bg-slate-50 border-t flex justify-end">
            <Button variant="outline" onClick={() => setIsHistoryOpen(false)} className="h-9 px-4 border-slate-200">
              Close Analytics
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
