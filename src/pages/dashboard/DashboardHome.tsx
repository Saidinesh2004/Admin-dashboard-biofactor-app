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
  CircleDollarSign
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
import { Link } from 'react-router-dom'

const pieData = [
  { name: 'Open Loads', value: 40, color: '#136B31' },
  { name: 'Bids Received', value: 30, color: '#28A745' },
  { name: 'Approved', value: 15, color: '#FFB800' },
  { name: 'Completed', value: 15, color: '#94A3B8' },
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
          <p className="text-gray-500 mt-1">Real-time overview of your loads, bids, and revenue.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white border-gray-200">Export Report</Button>
          <Link to="/create-load">
            <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
              <PlusCircle size={18} /> Create New Load
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <KPICard 
          title="Total Loads" 
          value={342} 
          icon={Package} 
          trend={12} 
          trendType="up" 
          color="bg-blue-600" 
        />
        <KPICard 
          title="Active Bids" 
          value={156} 
          icon={TrendingUp} 
          trend={8} 
          trendType="up" 
          color="bg-yellow-500" 
        />
        <KPICard 
          title="Approved Loads" 
          value={84} 
          icon={CheckCircle} 
          trend={5} 
          trendType="down" 
          color="bg-green-600" 
        />
        <KPICard 
          title="Revenue" 
          value="₹14.5L" 
          icon={CircleDollarSign} 
          trend={22} 
          trendType="up" 
          color="bg-indigo-600" 
        />
        <KPICard 
          title="Vehicles Active" 
          value={112} 
          icon={Truck} 
          trend={4} 
          trendType="up" 
          color="bg-purple-600" 
        />
        <KPICard 
          title="Payments Pending" 
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
          <div className="bg-green-50 p-6 border-b border-green-100">
            <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
              <PlusCircle size={20} /> Quick Create Load
            </h3>
            <p className="text-xs text-green-600/80 mt-1">Post a new load requirement to the marketplace instantly.</p>
          </div>
          <CardContent className="p-6">
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">From Location</label>
                  <Input placeholder="City, State" className="bg-gray-50 border-gray-100 focus-visible:ring-green-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">To Location</label>
                  <Input placeholder="City, State" className="bg-gray-50 border-gray-100 focus-visible:ring-green-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Product Type</label>
                  <Input placeholder="e.g. Rice, Steel" className="bg-gray-50 border-gray-100 focus-visible:ring-green-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Quantity (Tonnes)</label>
                  <Input type="number" placeholder="0.00" className="bg-gray-50 border-gray-100 focus-visible:ring-green-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Base Rate / Tonne</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <Input type="number" placeholder="0.00" className="pl-7 bg-gray-50 border-gray-100 focus-visible:ring-green-500" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Dispatch Date</label>
                  <Input type="date" className="bg-gray-50 border-gray-100 focus-visible:ring-green-500" />
                </div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white mt-4 py-6 font-bold uppercase tracking-wider shadow-md">
                Create & Publish Load
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Live Loads Activity */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Load Activity</CardTitle>
              <CardDescription>Latest loads posted to the marketplace</CardDescription>
            </div>
            <Link to="/loads">
              <Button variant="ghost" size="sm" className="text-green-700 gap-1 hover:text-green-800 hover:bg-green-50">
                View All <ArrowRight size={14} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {loads.slice(0, 3).map((load) => (
              <motion.div 
                key={load.id}
                whileHover={{ x: 5 }}
                className="group border border-gray-100 rounded-xl p-4 hover:bg-green-50/50 transition-all duration-200 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                      <Package size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{load.id}</span>
                        <Badge variant="outline" className="text-[10px] font-bold border-green-200 text-green-700 bg-green-50">
                          {load.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{load.from} → {load.to}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase">Base Rate</p>
                    <p className="text-sm font-bold text-gray-900">₹{load.rate}/T</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-2 mt-2 border-t border-gray-50">
                   <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={14} className="text-gray-400" />
                      <span>{load.date}</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <TrendingUp size={14} className="text-orange-500" />
                      <span className="font-bold text-orange-600">{load.bidCount} Bids</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Package size={14} className="text-gray-400" />
                      <span>{load.quantity} Tonnes</span>
                   </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardHome
