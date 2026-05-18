import React, { useState } from 'react';
import { 
  UserCheck, Search, Filter, MoreHorizontal, CheckCircle2, 
  XCircle, AlertCircle, Clock, ShieldCheck, Eye, Truck, MapPin, 
  Calendar, Weight, CircleDollarSign, ArrowRight, Bell, User
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoadStore } from '@/store/loadStore';
import { useTransporterStore } from '@/store/transporterStore';
import { useToast } from '@/hooks/use-toast';

const mockTransporters = [
  { id: 'TR-1001', name: 'Agarwal Packers & Movers', phone: '+91 9876543210', city: 'Mumbai', fleet: 25, status: 'Pending', documents: '8/10' },
  { id: 'TR-1002', name: 'SafeWay Logistics Pvt Ltd', phone: '+91 9876543211', city: 'Delhi', fleet: 15, status: 'Approved', documents: '10/10' },
  { id: 'TR-1003', name: 'Speedy Trucks Co.', phone: '+91 9876543212', city: 'Chennai', fleet: 8, status: 'Under Review', documents: '9/10' },
  { id: 'TR-1004', name: 'Reliable Cargo Services', phone: '+91 9876543213', city: 'Kolkata', fleet: 40, status: 'Blacklisted', documents: '4/10' },
];

export default function Transporters() {
  const { toast } = useToast();
  const { loads, assignVehicle } = useLoadStore();
  const { notifications, markNotificationsAsRead } = useTransporterStore();
  
  // Tab states & search filters
  const [selectedTab, setSelectedTab] = useState('all');
  const [search, setSearch] = useState('');
  
  // Carrier Portal Dashboard Active Transporter
  const [selectedCarrier, setSelectedCarrier] = useState('Delhi Roadlines');
  
  // Fleet Allocation Form States
  const [allocationForm, setAllocationForm] = useState<{ [loadId: string]: { vehicle: string; driver: string } }>({});

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    if (value === 'portal') {
      markNotificationsAsRead();
    }
  };

  // Get active assigned loads for the selected transporter
  const assignedLoads = React.useMemo(() => {
    return loads.filter(l => l.assignedTransporter?.companyName === selectedCarrier);
  }, [loads, selectedCarrier]);

  // Transporter specific notification log
  const carrierNotifications = React.useMemo(() => {
    return notifications.filter(n => {
      const targetLoad = loads.find(l => l.id === n.loadId);
      return targetLoad?.assignedTransporter?.companyName === selectedCarrier || n.message.includes(selectedCarrier);
    });
  }, [notifications, selectedCarrier, loads]);

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
      className: "bg-green-600 text-white border-none shadow-md font-semibold"
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge className="bg-green-100 text-green-700 border-none">Approved</Badge>;
      case 'Pending': return <Badge className="bg-yellow-100 text-yellow-700 border-none">Pending</Badge>;
      case 'Under Review': return <Badge className="bg-blue-100 text-blue-700 border-none">Under Review</Badge>;
      case 'Blacklisted': return <Badge className="bg-red-100 text-red-700 border-none">Blacklisted</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter transporters for admin registry
  const filteredRegistry = React.useMemo(() => {
    return mockTransporters.filter(tr => {
      const matchesSearch = tr.name.toLowerCase().includes(search.toLowerCase()) || tr.id.toLowerCase().includes(search.toLowerCase()) || tr.city.toLowerCase().includes(search.toLowerCase());
      if (selectedTab === 'pending') return matchesSearch && tr.status === 'Pending';
      if (selectedTab === 'approved') return matchesSearch && tr.status === 'Approved';
      return matchesSearch;
    });
  }, [search, selectedTab]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transporter Console</h1>
          <p className="text-sm text-gray-500 mt-1">Manage registration credentials and view active carrier allocations.</p>
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
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-bold text-xs uppercase tracking-wider text-gray-500 data-[state=active]:text-primary">Transporter Registry</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-bold text-xs uppercase tracking-wider text-gray-500 data-[state=active]:text-primary">Pending Reviews</TabsTrigger>
          <TabsTrigger value="approved" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-bold text-xs uppercase tracking-wider text-gray-500 data-[state=active]:text-primary">Verified</TabsTrigger>
          <TabsTrigger value="portal" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-bold text-xs uppercase tracking-wider text-gray-500 data-[state=active]:text-primary flex items-center gap-2">
            <Truck size={14} /> Carrier Dashboard
          </TabsTrigger>
        </TabsList>

        {/* Transporter Registry Tables */}
        {(selectedTab === 'all' || selectedTab === 'pending' || selectedTab === 'approved') && (
          <TabsContent value={selectedTab} className="mt-0">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input 
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search by name, ID, city..." 
                      className="pl-9 bg-gray-50 border-gray-100" 
                    />
                  </div>
                  <Button variant="outline" className="gap-2 border-gray-100">
                    <Filter size={16} /> Filters
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-gray-100 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                      <TableRow>
                        <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Transporter</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Contact Info</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Fleet Size</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Docs Verified</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Status</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[10px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistry.map((tr) => (
                        <TableRow key={tr.id} className="hover:bg-gray-50/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                {tr.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold">{tr.name}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-tighter font-bold">{tr.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{tr.phone}</span>
                              <span className="text-[10px] text-gray-400">{tr.city}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-gray-200 text-gray-600 font-bold">{tr.fleet} Vehicles</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-secondary" 
                                  style={{ width: `${(parseInt(tr.documents.split('/')[0]) / parseInt(tr.documents.split('/')[1])) * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-gray-500">{tr.documents}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(tr.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/10">
                                <ShieldCheck size={18} />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="gap-2"><Eye size={14} /> View KYC</DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2 text-green-600 font-bold"><CheckCircle2 size={14} /> Approve</DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2 text-orange-600 font-bold"><XCircle size={14} /> Reject</DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2 text-red-600 font-bold"><AlertCircle size={14} /> Blacklist</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* TRANSPORTER DASHBOARD & CARRIER PORTAL */}
        <TabsContent value="portal" className="mt-0">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left Workspace: Selector & Real-Time Alerts */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* Transporter Switcher */}
              <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-5">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-300">Carrier Selector</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Select carrier to view dashboard from their side.</CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Operating Fleet Transporter</label>
                    <select
                      value={selectedCarrier}
                      onChange={e => setSelectedCarrier(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Delhi Roadlines">Delhi Roadlines</option>
                      <option value="FastFreight Solutions">FastFreight Solutions</option>
                      <option value="SafeWay Express">SafeWay Express</option>
                      <option value="BlueDart Road Carrier">BlueDart Road Carrier</option>
                      <option value="Agarwal Premium Movers">Agarwal Premium Movers</option>
                      <option value="VRL Logistics Ltd">VRL Logistics Ltd</option>
                      <option value="Gati Freight Services">Gati Freight Services</option>
                      <option value="TCI Transport Corporation">TCI Transport Corporation</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Carrier Notifications Feed */}
              <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 p-5">
                  <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Bell size={15} className="text-amber-500" /> Dispatch Alerts Log
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Allocation and negotiation history.</CardDescription>
                </CardHeader>
                <CardContent className="p-5 max-h-[350px] overflow-y-auto space-y-3.5 custom-scrollbar">
                  {carrierNotifications.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-6">No operational logs for this carrier.</p>
                  ) : (
                    carrierNotifications.map((notif, index) => (
                      <div key={index} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-3">
                        <div className={`p-1.5 rounded-full ${
                          notif.type === 'Assignment' ? 'bg-green-100 text-green-700' :
                          notif.type === 'CounterOffer' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          <Truck size={13} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LOAD ID: {notif.loadId}</p>
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
                    Assigned Loads Panel
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Accepted freight loads allocated for dispatch.</CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  {assignedLoads.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <Truck size={40} className="text-slate-200 mx-auto" />
                      <p className="text-sm text-slate-400 italic font-medium">No assigned loads for {selectedCarrier} in registry.</p>
                      <p className="text-xs text-slate-400/70">Go to "Manage Loads" and accept a bid for this carrier to allocate.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {assignedLoads.map((load) => {
                        const form = allocationForm[load.id] || { vehicle: '', driver: '' };
                        return (
                          <div key={load.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/30">
                            
                            {/* Allocation Header */}
                            <div className="p-4 bg-slate-100 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="space-y-0.5">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                  Load ID: <span className="font-mono text-green-700">{load.id}</span>
                                  <Badge className="bg-blue-100 text-blue-800 border-none font-bold text-[10px]">
                                    {load.status}
                                  </Badge>
                                </h3>
                                <p className="text-xs text-slate-400 font-mono">Trip Allocation ID: {load.tripId}</p>
                              </div>
                              <div className="text-xs font-mono font-bold text-green-700 text-right bg-white px-3 py-1 rounded-md border border-slate-200 shadow-2xs">
                                ₹{load.totalFreight.toLocaleString('en-IN')}
                              </div>
                            </div>

                            {/* Transit details */}
                            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-3 md:col-span-2">
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Transit Route</p>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800 bg-white border px-2.5 py-1 rounded-md shadow-2xs flex items-center gap-1.5">
                                      <MapPin size={12} className="text-green-600" /> {load.from}
                                    </span>
                                    {load.stops && load.stops.map((stop, idx) => (
                                      <React.Fragment key={idx}>
                                        <ArrowRight size={12} className="text-orange-400" />
                                        <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded">
                                          {stop}
                                        </span>
                                      </React.Fragment>
                                    ))}
                                    <ArrowRight size={12} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-800 bg-white border px-2.5 py-1 rounded-md shadow-2xs flex items-center gap-1.5">
                                      <MapPin size={12} className="text-blue-600" /> {load.to}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3.5">
                                  <div className="flex items-center gap-2.5 text-xs">
                                    <Weight size={14} className="text-slate-400" />
                                    <div>
                                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Cargo details</span>
                                      <span className="font-bold text-slate-800">{load.product} ({load.tonnes} T)</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2.5 text-xs">
                                    <Calendar size={14} className="text-slate-400" />
                                    <div>
                                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Dispatch timeline</span>
                                      <span className="font-bold text-slate-800">{load.dispatchDate}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Fleet and Driver assignment */}
                              <div className="border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 space-y-4">
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Fleet Assignment</p>
                                  
                                  {load.assignedVehicle ? (
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-3.5 space-y-2 text-xs">
                                      <div className="flex items-center gap-2 text-green-800 font-bold">
                                        <Truck size={14} />
                                        FLEET READY FOR DISPATCH
                                      </div>
                                      <div className="space-y-1 text-slate-700">
                                        <p><span className="text-slate-400 font-medium">Vehicle No:</span> <span className="font-mono font-bold text-slate-900">{load.assignedVehicle}</span></p>
                                        <p className="flex items-center gap-1"><span className="text-slate-400 font-medium">Driver:</span> <span className="font-bold text-slate-900 flex items-center gap-1"><User size={11} /> {load.assignedDriver}</span></p>
                                      </div>
                                    </div>
                                  ) : (
                                    <form onSubmit={(e) => handleAllocationSubmit(e, load.id)} className="space-y-3">
                                      <div className="space-y-1">
                                        <Input 
                                          value={form.vehicle}
                                          onChange={e => handleFormChange(load.id, 'vehicle', e.target.value)}
                                          placeholder="Vehicle Number (e.g. MH-12-PQ-9876)"
                                          className="bg-white border-slate-200 text-xs h-8 focus-visible:ring-primary shadow-none"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Input 
                                          value={form.driver}
                                          onChange={e => handleFormChange(load.id, 'driver', e.target.value)}
                                          placeholder="Driver Name"
                                          className="bg-white border-slate-200 text-xs h-8 focus-visible:ring-primary shadow-none"
                                        />
                                      </div>
                                      <Button 
                                        type="submit"
                                        className="w-full bg-primary hover:bg-primary-hover text-white text-[10px] uppercase font-bold tracking-wider h-8 rounded-lg shadow-xs"
                                      >
                                        Confirm Fleet Allocation
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
    </div>
  );
}
