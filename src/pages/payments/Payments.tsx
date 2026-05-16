
import { 
  CreditCard, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Search, 
  Filter, 
  MoreVertical
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

const transactions = [
  { id: 'PAY-8801', date: '2026-05-15', amount: '₹45,000', transporter: 'Agarwal Packers', type: 'Outgoing', status: 'Completed' },
  { id: 'PAY-8802', date: '2026-05-14', amount: '₹22,500', transporter: 'SafeWay Logistics', type: 'Outgoing', status: 'Pending' },
  { id: 'PAY-8803', date: '2026-05-14', amount: '₹18,000', transporter: 'Speedy Trucks', type: 'Outgoing', status: 'Processing' },
  { id: 'PAY-8804', date: '2026-05-12', amount: '₹35,000', transporter: 'Reliable Cargo', type: 'Outgoing', status: 'Completed' },
]

const Payments = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Manage transporter payouts and customer billing.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="bg-white border-gray-200">Payment History</Button>
           <Button className="bg-primary text-white gap-2">New Payout</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-none shadow-sm bg-primary text-white">
            <CardContent className="p-6">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Total Outstanding</p>
                     <h3 className="text-3xl font-bold mt-1">₹12,45,000</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                     <CreditCard size={24} />
                  </div>
               </div>
               <div className="mt-6 flex items-center gap-2 text-xs font-medium">
                  <span className="px-1.5 py-0.5 bg-white/20 rounded">Next Cycle: 20th May</span>
               </div>
            </CardContent>
         </Card>
         <Card className="border-none shadow-sm">
            <CardContent className="p-6">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Paid This Month</p>
                     <h3 className="text-3xl font-bold mt-1">₹8,92,000</h3>
                  </div>
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                     <CheckCircle2 size={24} />
                  </div>
               </div>
               <div className="mt-6 flex items-center gap-2 text-xs font-medium text-green-600">
                  <ArrowUpRight size={14} /> 12% increase from last month
               </div>
            </CardContent>
         </Card>
         <Card className="border-none shadow-sm">
            <CardContent className="p-6">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">In Review</p>
                     <h3 className="text-3xl font-bold mt-1">₹1,24,000</h3>
                  </div>
                  <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                     <Clock size={24} />
                  </div>
               </div>
               <div className="mt-6 flex items-center gap-2 text-xs font-medium text-yellow-600">
                  8 Invoices pending verification
               </div>
            </CardContent>
         </Card>
      </div>

      <Card className="border-none shadow-sm bg-white">
         <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <CardTitle>Recent Transactions</CardTitle>
               <div className="flex items-center gap-2">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                     <Input placeholder="Search payments..." className="pl-9 h-9 text-xs bg-gray-50 border-gray-100" />
                  </div>
                  <Button variant="outline" size="sm" className="h-9 gap-1 border-gray-100"><Filter size={14} /> Filter</Button>
               </div>
            </div>
         </CardHeader>
         <CardContent>
            <div className="rounded-lg border border-gray-100 overflow-hidden">
               <Table>
                  <TableHeader className="bg-gray-50/50">
                     <TableRow>
                        <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Transaction ID</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Date</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Transporter</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Amount</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Status</TableHead>
                        <TableHead className="font-bold text-gray-500 uppercase text-[10px] text-right">Actions</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {transactions.map((tx) => (
                        <TableRow key={tx.id} className="hover:bg-gray-50/50">
                           <TableCell className="font-bold text-xs">{tx.id}</TableCell>
                           <TableCell className="text-xs text-gray-500">{tx.date}</TableCell>
                           <TableCell className="font-medium text-sm">{tx.transporter}</TableCell>
                           <TableCell className="font-bold text-sm">{tx.amount}</TableCell>
                           <TableCell>
                              {tx.status === 'Completed' ? (
                                 <Badge className="bg-green-100 text-green-700 border-none">Completed</Badge>
                              ) : tx.status === 'Pending' ? (
                                 <Badge className="bg-yellow-100 text-yellow-700 border-none">Pending</Badge>
                              ) : (
                                 <Badge className="bg-blue-100 text-blue-700 border-none">Processing</Badge>
                              )}
                           </TableCell>
                           <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical size={16} /></Button>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         </CardContent>
      </Card>
    </div>
  )
}

export default Payments
