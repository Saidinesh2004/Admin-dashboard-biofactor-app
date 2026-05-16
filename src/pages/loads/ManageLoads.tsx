import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  ArrowRight
} from 'lucide-react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLogisticsStore } from '@/store/useStore'

const ManageLoads = () => {
  const { loads } = useLogisticsStore()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open': return <Badge className="bg-blue-100 text-blue-700 border-none">Open</Badge>
      case 'Bidding': return <Badge className="bg-yellow-100 text-yellow-700 border-none">Bidding</Badge>
      case 'Approved': return <Badge className="bg-green-100 text-green-700 border-none">Approved</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Loads</h1>
          <p className="text-sm text-gray-500 mt-1">Total {loads.length} loads found in the system.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-white border-gray-200">
            <Download size={16} /> Export
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-white">
            <Plus size={16} /> New Load
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input placeholder="Search by Load ID, Route..." className="pl-9 bg-gray-50 border-gray-100" />
            </div>
            <div className="flex items-center gap-2">
               <Button variant="outline" className="gap-2 text-xs font-bold border-gray-100">
                 <Filter size={14} /> Status: All
               </Button>
               <Button variant="outline" className="gap-2 text-xs font-bold border-gray-100">
                 <Filter size={14} /> Product: All
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[100px] font-bold text-gray-500 uppercase text-[10px]">Load ID</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Route (From → To)</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Product & Qty</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Base Rate</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Bids</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-[10px]">Status</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-[10px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loads.map((load) => (
                  <TableRow key={load.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-bold text-sm text-primary">{load.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{load.from}</span>
                          <span className="text-[10px] text-gray-400">Dispatch: {load.date}</span>
                        </div>
                        <ArrowRight size={14} className="text-gray-300" />
                        <span className="text-sm font-medium">{load.to}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{load.product}</span>
                        <span className="text-[10px] text-gray-400">{load.quantity} Tonnes</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-sm">₹{load.rate}/T</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <span className="text-sm font-bold text-secondary">{load.bidCount}</span>
                         <span className="text-[10px] text-gray-400 font-medium">bids</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(load.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Options</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-2"><Eye size={14} /> View Details</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2"><Edit size={14} /> Edit Load</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-red-600"><Trash2 size={14} /> Cancel Load</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default ManageLoads
