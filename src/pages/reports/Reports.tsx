import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Calendar, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

const routeCostData = [
  { route: 'Kolkata-Patna', cost: 2200, prevCost: 2100 },
  { route: 'Nagpur-Hyd', cost: 1800, prevCost: 1850 },
  { route: 'Mum-Pune', cost: 1200, prevCost: 1150 },
  { route: 'Del-Jai', cost: 1500, prevCost: 1400 },
  { route: 'Che-Blr', cost: 1900, prevCost: 1800 },
]

const monthlyVolumeData = [
  { name: 'Jan', volume: 400 },
  { name: 'Feb', volume: 300 },
  { name: 'Mar', volume: 600 },
  { name: 'Apr', volume: 800 },
  { name: 'May', volume: 500 },
  { name: 'Jun', volume: 700 },
]

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Analytics & Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Deep dive into logistics performance and cost metrics.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="gap-2 bg-white"><Calendar size={16} /> Last 30 Days</Button>
           <Button className="bg-primary text-white gap-2"><Download size={16} /> Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Route-wise Freight Cost</CardTitle>
            <CardDescription>Comparison of current vs previous month average rates</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeCostData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="route" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cost" name="Current (₹)" fill="#136B31" radius={[0, 4, 4, 0]} />
                <Bar dataKey="prevCost" name="Previous (₹)" fill="#94A3B8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Dispatch Volume</CardTitle>
            <CardDescription>Number of successful deliveries across all routes</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyVolumeData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#136B31" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#136B31" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="volume" stroke="#136B31" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
             <div>
                <CardTitle>State-wise Dispatch Report</CardTitle>
                <CardDescription>Breakdown of logistics activity by region</CardDescription>
             </div>
             <Button variant="ghost" size="sm" className="text-primary font-bold">View Full Report</Button>
          </div>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { state: 'Maharashtra', loads: 145, growth: '+12%' },
                { state: 'West Bengal', loads: 98, growth: '+5%' },
                { state: 'Tamil Nadu', loads: 112, growth: '-2%' },
                { state: 'Delhi NCR', loads: 167, growth: '+18%' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.state}</p>
                   <div className="flex items-end justify-between mt-1">
                      <h4 className="text-xl font-bold">{item.loads}</h4>
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", item.growth.startsWith('+') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {item.growth}
                      </span>
                   </div>
                </div>
              ))}
           </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Reports
