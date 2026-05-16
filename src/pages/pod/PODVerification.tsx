import { 
  Search, 
  ArrowRight,
  Download,
  Eye
} from 'lucide-react'

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'


const podQueue = [
  { id: 'LD-1003', route: 'Jalandhar → Delhi', transporter: 'Speedy Trucks', receivedQty: 30, deliveredQty: 29.5, shortage: 0.5, penalty: '₹1500', status: 'Pending' },
  { id: 'LD-1005', route: 'Mumbai → Pune', transporter: 'Reliable Cargo', receivedQty: 20, deliveredQty: 20, shortage: 0, penalty: '₹0', status: 'Verified' },
  { id: 'LD-1008', route: 'Chennai → Bangalore', transporter: 'SafeWay Logistics', receivedQty: 15, deliveredQty: 14.8, shortage: 0.2, penalty: '₹600', status: 'Review Needed' },
]

const PODVerification = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">POD Verification Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Verify delivered quantities and approve payments.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
           <Download size={16} /> Download Pending List
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input placeholder="Search Load ID or Transporter..." className="pl-9 bg-gray-50 border-gray-100" />
            </div>
            <div className="flex gap-2">
               <Badge className="bg-blue-50 text-blue-700 border-none px-3 py-1">Total: 42</Badge>
               <Badge className="bg-yellow-50 text-yellow-700 border-none px-3 py-1">Pending: 12</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <div className="rounded-lg border border-gray-100 overflow-hidden">
             <Table>
               <TableHeader className="bg-gray-50/50">
                 <TableRow>
                   <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Load ID</TableHead>
                   <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Route</TableHead>
                   <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Qty (Recv/Delv)</TableHead>
                   <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Shortage / Penalty</TableHead>
                   <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Status</TableHead>
                   <TableHead className="font-bold text-gray-500 uppercase text-[10px] text-right">Action</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {podQueue.map((item) => (
                   <TableRow key={item.id} className="hover:bg-gray-50/50">
                     <TableCell className="font-bold text-sm">{item.id}</TableCell>
                     <TableCell>
                        <div className="flex flex-col">
                           <span className="text-sm font-medium">{item.route}</span>
                           <span className="text-[10px] text-gray-400 font-bold uppercase">{item.transporter}</span>
                        </div>
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-medium">{item.receivedQty}T</span>
                           <ArrowRight size={12} className="text-gray-300" />
                           <span className={cn("text-sm font-bold", item.shortage > 0 ? "text-red-500" : "text-green-600")}>
                              {item.deliveredQty}T
                           </span>
                        </div>
                     </TableCell>
                     <TableCell>
                        <div className="flex flex-col">
                           <span className={cn("text-sm font-bold", item.shortage > 0 ? "text-red-500" : "text-gray-900")}>
                              {item.shortage}T
                           </span>
                           <span className="text-[10px] text-gray-400">Penalty: {item.penalty}</span>
                        </div>
                     </TableCell>
                     <TableCell>
                        {item.status === 'Verified' ? (
                           <Badge className="bg-green-100 text-green-700 border-none">Verified</Badge>
                        ) : item.status === 'Pending' ? (
                           <Badge className="bg-yellow-100 text-yellow-700 border-none">Pending</Badge>
                        ) : (
                           <Badge className="bg-red-100 text-red-700 border-none">Review Needed</Badge>
                        )}
                     </TableCell>
                     <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                           <Button size="sm" variant="ghost" className="h-8 text-primary gap-1">
                              <Eye size={14} /> View POD
                           </Button>
                           <Button size="sm" className="bg-primary text-white h-8">Verify</Button>
                        </div>
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

export default PODVerification

