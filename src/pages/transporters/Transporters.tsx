import React from 'react'
import { 
  UserCheck, 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Clock,
  ShieldCheck,
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const transporters = [
  { id: 'TR-1001', name: 'Agarwal Packers & Movers', phone: '+91 9876543210', city: 'Mumbai', fleet: 25, status: 'Pending', documents: '8/10' },
  { id: 'TR-1002', name: 'SafeWay Logistics Pvt Ltd', phone: '+91 9876543211', city: 'Delhi', fleet: 15, status: 'Approved', documents: '10/10' },
  { id: 'TR-1003', name: 'Speedy Trucks Co.', phone: '+91 9876543212', city: 'Chennai', fleet: 8, status: 'Under Review', documents: '9/10' },
  { id: 'TR-1004', name: 'Reliable Cargo Services', phone: '+91 9876543213', city: 'Kolkata', fleet: 40, status: 'Blacklisted', documents: '4/10' },
]

const Transporters = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge className="bg-green-100 text-green-700 border-none">Approved</Badge>
      case 'Pending': return <Badge className="bg-yellow-100 text-yellow-700 border-none">Pending</Badge>
      case 'Under Review': return <Badge className="bg-blue-100 text-blue-700 border-none">Under Review</Badge>
      case 'Blacklisted': return <Badge className="bg-red-100 text-red-700 border-none">Blacklisted</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transporter Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Manage registrations submitted from the mobile app.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="px-3 py-1 bg-white flex items-center gap-2">
             <Clock size={14} className="text-yellow-500" />
             <span className="text-xs font-bold">12 Pending Registrations</span>
           </Badge>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-white border-b border-gray-100 rounded-none w-full justify-start h-auto p-0 mb-6">
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-bold text-xs uppercase tracking-wider text-gray-500 data-[state=active]:text-primary">All Transporters</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-bold text-xs uppercase tracking-wider text-gray-500 data-[state=active]:text-primary">Pending</TabsTrigger>
          <TabsTrigger value="approved" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-bold text-xs uppercase tracking-wider text-gray-500 data-[state=active]:text-primary">Approved</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <Input placeholder="Search by name, ID, city..." className="pl-9 bg-gray-50 border-gray-100" />
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
                    {transporters.map((tr) => (
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
      </Tabs>
    </div>
  )
}

export default Transporters
