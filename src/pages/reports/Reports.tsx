import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, Calendar, FileText, FileSpreadsheet, Loader2, 
  IndianRupee, Truck, Users, Clock, FileCheck, Building2, TrendingUp, TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportToPDF } from '@/utils/exportPdf';
import { exportToCSV, exportToExcel } from '@/utils/exportCsv';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const routeCostData = [
  { route: 'Kolkata-Patna', cost: 2200, prevCost: 2100 },
  { route: 'Nagpur-Hyd', cost: 1800, prevCost: 1850 },
  { route: 'Mum-Pune', cost: 1200, prevCost: 1150 },
  { route: 'Del-Jai', cost: 1500, prevCost: 1400 },
  { route: 'Che-Blr', cost: 1900, prevCost: 1800 },
];

const monthlyVolumeData = [
  { name: 'Jan', volume: 400, deliveries: 380, delayed: 20 },
  { name: 'Feb', volume: 300, deliveries: 290, delayed: 10 },
  { name: 'Mar', volume: 600, deliveries: 550, delayed: 50 },
  { name: 'Apr', volume: 800, deliveries: 750, delayed: 50 },
  { name: 'May', volume: 500, deliveries: 480, delayed: 20 },
  { name: 'Jun', volume: 700, deliveries: 680, delayed: 20 },
];

const stateData = [
  { state: 'Maharashtra', loads: 145, growth: '+12%', progress: 85 },
  { state: 'West Bengal', loads: 98, growth: '+5%', progress: 60 },
  { state: 'Tamil Nadu', loads: 112, growth: '-2%', progress: 45 },
  { state: 'Delhi NCR', loads: 167, growth: '+18%', progress: 95 },
];

const kpiMetrics = [
  { title: 'Total Revenue', value: '₹ 45.2L', icon: IndianRupee, trend: '+15%', color: 'text-green-600', bg: 'bg-green-100' },
  { title: 'Total Loads', value: '1,248', icon: Truck, trend: '+8%', color: 'text-blue-600', bg: 'bg-blue-100' },
  { title: 'Active Transporters', value: '342', icon: Users, trend: '+12%', color: 'text-purple-600', bg: 'bg-purple-100' },
  { title: 'Delayed Deliveries', value: '24', icon: Clock, trend: '-5%', color: 'text-orange-600', bg: 'bg-orange-100' },
  { title: 'POD Pending', value: '156', icon: FileCheck, trend: '-2%', color: 'text-red-600', bg: 'bg-red-100' },
  { title: 'Total Freight Cost', value: '₹ 32.5L', icon: IndianRupee, trend: '+10%', color: 'text-teal-600', bg: 'bg-teal-100' },
];

const Reports = () => {
  const { toast } = useToast();
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [timeFilter, setTimeFilter] = useState('Last 6 Months');

  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);
      // Wait for React to render the PDF Header
      setTimeout(async () => {
        try {
          const date = new Date().toISOString().split('T')[0];
          const filename = `Biofactor_Report_${date}.pdf`;
          
          await exportToPDF('analytics-report-container', filename);
          
          toast({
            title: "Success",
            description: "Report downloaded successfully.",
            className: "bg-green-500 text-white border-none",
          });
        } catch (err) {
          throw err;
        } finally {
          setIsExportingPDF(false);
        }
      }, 300);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate report.",
        variant: "destructive",
      });
      setIsExportingPDF(false);
    }
  };

  const handleExportCSV = () => {
    const date = new Date().toISOString().split('T')[0];
    exportToCSV(routeCostData, `Route_Costs_${date}.csv`);
    toast({
      title: "Exported",
      description: "CSV file downloaded successfully.",
    });
  };

  const handleExportExcel = () => {
    const date = new Date().toISOString().split('T')[0];
    exportToExcel(monthlyVolumeData, `Monthly_Volume_${date}.xls`);
    toast({
      title: "Exported",
      description: "Excel file downloaded successfully.",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logistics Analytics & Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Enterprise logistics performance and cost metrics.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="gap-2 bg-white">
                    <Calendar size={16} /> {timeFilter}
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 {['Last 7 Days', 'Last 30 Days', 'Last 6 Months', 'Custom Date Range'].map(f => (
                    <DropdownMenuItem key={f} onClick={() => setTimeFilter(f)}>{f}</DropdownMenuItem>
                 ))}
              </DropdownMenuContent>
           </DropdownMenu>

           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button disabled={isExportingPDF} className="bg-primary hover:bg-primary/90 text-white gap-2 transition-all shadow-md">
                    {isExportingPDF ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {isExportingPDF ? "Generating PDF..." : "Export Report"}
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                 <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
                    <FileText size={16} className="text-red-500" /> Export PDF
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
                    <FileSpreadsheet size={16} className="text-green-600" /> Export CSV
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
                    <FileSpreadsheet size={16} className="text-blue-600" /> Export Excel
                 </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>

      {/* Wrapping the content for PDF Export */}
      <div id="analytics-report-container" className="space-y-6 bg-[#f8fafc] p-2 rounded-xl">
        
        {/* PDF Header (Only visible inside PDF via conditional rendering) */}
        <div className={cn("text-center mb-6 pb-6 border-b", isExportingPDF ? "block" : "hidden")}>
           <h2 className="text-3xl font-bold text-gray-800">Biofactor Logistics Analytics</h2>
           <p className="text-gray-500 mt-2">Comprehensive Freight & Dispatch Performance Report</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiMetrics.map((kpi, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("p-2 rounded-lg", kpi.bg)}>
                      <kpi.icon size={18} className={kpi.color} />
                    </div>
                    <span className={cn("text-xs font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full", 
                      kpi.trend.startsWith('+') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {kpi.trend.startsWith('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {kpi.trend}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{kpi.value}</h3>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{kpi.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Route-wise Cost */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Route-wise Freight Cost</CardTitle>
                <CardDescription>Comparison of current vs previous average rates (₹)</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={routeCostData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="route" type="category" width={100} tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="cost" name="Current Cost" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={16} />
                    <Bar dataKey="prevCost" name="Previous Cost" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Volume */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Monthly Dispatch Volume</CardTitle>
                    <CardDescription>Deliveries trend over the {timeFilter.toLowerCase()}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">3,300</p>
                    <p className="text-xs text-gray-500">Total YTD</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="volume" name="Total Volume" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" activeDot={{ r: 6, strokeWidth: 0, fill: '#16a34a' }} />
                    <Area type="monotone" dataKey="deliveries" name="Deliveries" stroke="#3b82f6" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* State-wise Report Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Building2 size={20} /></div>
                  <div>
                    <CardTitle className="text-lg">State-wise Dispatch Report</CardTitle>
                    <CardDescription>Regional breakdown of logistics activity</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5">View Full Report</Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-gray-50/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stateData.map((item, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -5 }}
                    className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all group"
                  >
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 group-hover:text-primary transition-colors">{item.state}</p>
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <h4 className="text-3xl font-black text-gray-800">{item.loads}</h4>
                        <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">Total Loads</p>
                      </div>
                      <span className={cn("text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1", 
                        item.growth.startsWith('+') ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                      )}>
                        {item.growth.startsWith('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {item.growth}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1 overflow-hidden">
                      <div 
                        className={cn("h-1.5 rounded-full transition-all duration-1000", 
                          item.progress > 80 ? 'bg-green-500' : item.progress > 50 ? 'bg-blue-500' : 'bg-orange-500'
                        )}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-semibold mt-2">
                      <span>Target Completion</span>
                      <span className="text-gray-600">{item.progress}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
};

export default Reports;
