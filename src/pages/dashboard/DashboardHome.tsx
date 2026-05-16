import { motion } from 'framer-motion'
import { 
  Package, 
  TrendingUp, 
  CheckCircle, 
  Truck, 
  Wallet,
  ArrowRight,
  PlusCircle,
  Clock,
  ExternalLink
} from 'lucide-react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import KPICard from '@/components/shared/KPICard'
import { useLogisticsStore } from '@/store/useStore'

const pieData = [
  { name: 'Open Loads', value: 40, color: '#136B31' },
  { name: 'Bids Received', value: 30, color: '#28A745' },
  { name: 'Approved', value: 15, color: '#FFB800' },
  { name: 'Confirmed', value: 10, color: '#2D3FEF' },
  { name: 'Completed', value: 5, color: '#94A3B8' },
]

const barData = [
  { name: 'Mon', loads: 12, bids: 45 },
  { name: 'Tue', loads: 19, bids: 52 },
  { name: 'Wed', loads: 15, bids: 38 },
  { name: 'Thu', loads: 22, bids: 61 },
  { name: 'Fri', loads: 30, bids: 75 },
  { name: 'Sat', loads: 10, bids: 28 },
  { name: 'Sun', loads: 8, bids: 15 },
]

const DashboardHome = () => {
  const { loads } = useLogisticsStore()

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Logistics Control Center</h1>
          <p className="text-gray-500 mt-1">Real-time overview of your supply chain operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white border-gray-200">Export Report</Button>
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <PlusCircle size={18} /> Create New Load
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard 
          title="Open Loads" 
          value={42} 
          icon={Package} 
          trend={12} 
          trendType="up" 
          color="bg-primary" 
        />
        <KPICard 
          title="Bids Received" 
          value={156} 
          icon={TrendingUp} 
          trend={8} 
          trendType="up" 
          color="bg-secondary" 
        />
        <KPICard 
          title="Approved / Waiting" 
          value={18} 
          icon={CheckCircle} 
          trend={5} 
          trendType="down" 
          color="bg-yellow-500" 
        />
        <KPICard 
          title="Trips Confirmed" 
          value={24} 
          icon={Truck} 
          trend={15} 
          trendType="up" 
          color="bg-blue-600" 
        />
        <KPICard 
          title="Pending Payments" 
          value="₹4.2L" 
          icon={Wallet} 
          trend={2} 
          trendType="down" 
          color="bg-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Charts */}
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Dispatch vs Bids Trend</CardTitle>
              <CardDescription>Weekly activity for loads and transporter bids</CardDescription>
            </div>
            <Tabs defaultValue="7days" className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="7days">7 Days</TabsTrigger>
                <TabsTrigger value="30days">30 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="loads" name="Loads Created" fill="#136B31" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="bids" name="Bids Received" fill="#28A745" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Load Status Donut */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Load Status Overview</CardTitle>
            <CardDescription>Current state of all active loads</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-500">{item.name}</span>
                  <span className="text-xs font-bold ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Create Load Panel */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-primary/10">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <PlusCircle size={20} /> Quick Create Load
            </h3>
            <p className="text-xs text-gray-500 mt-1">Post a new load requirement to the marketplace instantly.</p>
          </div>
          <CardContent className="p-6">
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">From Location</label>
                  <Input placeholder="City, State" className="bg-gray-50 border-gray-100" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">To Location</label>
                  <Input placeholder="City, State" className="bg-gray-50 border-gray-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Product Type</label>
                  <Input placeholder="e.g. Rice, Steel" className="bg-gray-50 border-gray-100" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Quantity (Tonnes)</label>
                  <Input type="number" placeholder="0.00" className="bg-gray-50 border-gray-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Base Rate / Tonne</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <Input type="number" placeholder="0.00" className="pl-7 bg-gray-50 border-gray-100" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Dispatch Date</label>
                  <Input type="date" className="bg-gray-50 border-gray-100" />
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white mt-4 py-6 font-bold uppercase tracking-wider">
                Create & Publish Load
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Live Loads & Bids Section */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Live Marketplace Activity</CardTitle>
              <CardDescription>Real-time bids coming in from transporters</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              View All <ArrowRight size={14} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loads.map((load) => (
              <motion.div 
                key={load.id}
                whileHover={{ x: 5 }}
                className="group border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <Package size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{load.id}</span>
                        <Badge variant="outline" className="text-[10px] font-bold border-primary text-primary bg-primary/5">
                          {load.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">{load.from} → {load.to}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase">Base Rate</p>
                    <p className="text-sm font-bold text-gray-900">₹{load.rate}/T</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-3 border-y border-gray-50 mb-3">
                   <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={14} className="text-gray-400" />
                      <span>{load.date}</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <TrendingUp size={14} className="text-secondary" />
                      <span className="font-bold text-secondary">{load.bidCount} Bids</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Package size={14} className="text-gray-400" />
                      <span>{load.quantity} Tonnes</span>
                   </div>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] font-bold text-secondary">
                        L
                      </div>
                      <div className="text-[10px]">
                        <p className="text-gray-400 leading-none">Lowest Bid</p>
                        <p className="font-bold text-gray-800">₹{load.rate - 100} (XYZ Logi)</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="h-8 text-xs">View Bids</Button>
                      <Button size="sm" className="h-8 text-xs bg-secondary hover:bg-secondary/90">Accept Bid</Button>
                   </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Queue & POD Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="xl:col-span-2 border-none shadow-sm bg-white overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
               <div>
                 <CardTitle>Approval Queue</CardTitle>
                 <CardDescription>Loads awaiting transporter confirmation or final approval</CardDescription>
               </div>
               <Badge className="bg-yellow-500">7 Pending</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-100">
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Load Details</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Transporter</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Price/Tonne</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold">LD-99{i}</p>
                        <p className="text-xs text-gray-500">Kolkata → Patna</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">SafeWay Logistics</p>
                        <p className="text-[10px] text-gray-400">Rating: 4.8/5</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-sm">₹2,150</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200">
                          Waiting Acceptance
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" className="bg-primary text-white h-8 text-xs">Approve</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Confirmed Trips Panel */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>In-Transit Trips</CardTitle>
            <CardDescription>Live tracking of confirmed dispatches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             {[1, 2, 3].map(i => (
               <div key={i} className="relative pl-6 border-l-2 border-gray-100 space-y-2">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
                 <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold">TR-400{i}</p>
                      <p className="text-xs text-gray-500">Mumbai → Hyderabad</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                      In Transit
                    </Badge>
                 </div>
                 <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${30 * i}%` }}
                      className="bg-blue-500 h-full"
                    />
                 </div>
                 <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                    <span className="flex items-center gap-1"><Clock size={12} /> ETA: 12h 30m</span>
                    <span className="text-blue-600 cursor-pointer flex items-center gap-1">Track <ExternalLink size={10} /></span>
                 </div>
               </div>
             ))}
             <Button variant="ghost" className="w-full text-primary text-xs font-bold border-t border-gray-50 pt-4 rounded-none">
                VIEW ALL LIVE TRIPS
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardHome
