
import { 
  Truck, 
  MapPin, 
  Clock, 
  Filter, 
  Navigation,
  MoreHorizontal,
  Phone
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

const trips = [
  { id: 'TR-5001', loadId: 'LD-1001', route: 'Kolkata → Patna', transporter: 'Agarwal Packers', driver: 'Rahul Sharma', status: 'In Transit', progress: 65, eta: '4 hours', location: 'Asansol, WB' },
  { id: 'TR-5002', loadId: 'LD-1002', route: 'Nagpur → Hyderabad', transporter: 'SafeWay Logistics', driver: 'Suresh Kumar', status: 'In Transit', progress: 25, eta: '18 hours', location: 'Adilabad, TS' },
  { id: 'TR-5003', loadId: 'LD-1003', route: 'Jalandhar → Delhi', transporter: 'Speedy Trucks', driver: 'Amit Singh', status: 'POD Pending', progress: 100, eta: 'Delivered', location: 'Delhi, DL' },
  { id: 'TR-5004', loadId: 'LD-1005', route: 'Mumbai → Pune', transporter: 'Reliable Cargo', driver: 'Vikram Rao', status: 'Completed', progress: 100, eta: '-', location: 'Pune, MH' },
]

const Trips = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Transit': return <Badge className="bg-blue-100 text-blue-700 border-none">In Transit</Badge>
      case 'POD Pending': return <Badge className="bg-orange-100 text-orange-700 border-none font-bold animate-pulse">POD Pending</Badge>
      case 'Completed': return <Badge className="bg-green-100 text-green-700 border-none">Completed</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Trip Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time status of all active and past dispatches.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-white border-gray-200">
             <Filter size={16} /> Filters
          </Button>
          <Button className="bg-primary text-white gap-2">
             <Navigation size={16} /> Map View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: 'Active Trips', value: '14', color: 'text-blue-600' },
           { label: 'POD Pending', value: '08', color: 'text-orange-600' },
           { label: 'Delayed', value: '03', color: 'text-red-600' },
           { label: 'Delivered Today', value: '22', color: 'text-green-600' }
         ].map((stat, i) => (
           <Card key={i} className="border-none shadow-sm">
             <CardContent className="p-4">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
               <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
             </CardContent>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {trips.map((trip) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.005 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group transition-all"
          >
            <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-6">
               <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-primary/5 transition-colors">
                     <Truck size={24} className="text-gray-400 group-hover:text-primary" />
                  </div>
                  <div>
                     <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{trip.id}</span>
                        <span className="text-[10px] font-bold text-gray-400">LOAD: {trip.loadId}</span>
                     </div>
                     <p className="text-xs text-gray-500 font-medium">{trip.route}</p>
                  </div>
               </div>

               <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-400 font-medium flex items-center gap-1">
                        <MapPin size={12} /> Last Location: <span className="text-gray-900 font-bold">{trip.location}</span>
                     </span>
                     <span className="text-gray-400 font-medium flex items-center gap-1">
                        <Clock size={12} /> ETA: <span className="text-gray-900 font-bold">{trip.eta}</span>
                     </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                     <div 
                        className={`h-full transition-all duration-1000 ${trip.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${trip.progress}%` }}
                     />
                  </div>
               </div>

               <div className="flex flex-col md:flex-row items-start md:items-center gap-6 min-w-[300px]">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase">
                        {trip.transporter.split(' ')[0][0]}
                     </div>
                     <div>
                        <p className="text-xs font-bold text-gray-900">{trip.transporter}</p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                           <Phone size={10} /> {trip.driver}
                        </p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                     {getStatusBadge(trip.status)}
                     <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal size={18} />
                     </Button>
                  </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Trips
