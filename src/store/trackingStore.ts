import { create } from 'zustand';

export type TripStatus = 'In Transit' | 'Loading' | 'Unloading' | 'Delayed' | 'Idle' | 'Completed' | 'Offline';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Stop {
  name: string;
  duration: string;
  lat: number;
  lng: number;
  idle: boolean;
  engineOff: boolean;
}

export interface TimelineEvent {
  time: string;
  event: string;
  status: 'info' | 'warning' | 'success' | 'danger';
}

export interface VehicleTrip {
  id: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  transporter: string;
  status: TripStatus;
  speed: number;
  eta: string;
  origin: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  currentCoords: LatLng;
  routeCoords: LatLng[];
  currentIndex: number; // For GPS animation simulation index
  stops: Stop[];
  fuel: number;
  lastUpdated: string;
  timeline: TimelineEvent[];
  deviationAlert: boolean;
  unauthorizedStop: boolean;
  idleTime: string;
  geofences: { name: string; radius: number; lat: number; lng: number; inside: boolean }[];
}

export interface LiveAlert {
  id: string;
  vehicleNumber: string;
  driverName: string;
  type: 'Stopped Too Long' | 'Unauthorized Stop' | 'Route Deviation' | 'Vehicle Offline' | 'Delay Alert';
  message: string;
  time: string;
  severity: 'warning' | 'critical';
  read: boolean;
}

interface TrackingState {
  trips: VehicleTrip[];
  alerts: LiveAlert[];
  selectedTripId: string | null;
  mapViewMode: 'light' | 'dark' | 'satellite' | 'traffic';
  isReplayingRoute: boolean;
  searchQuery: string;
  statusFilter: string;
  setSelectedTripId: (id: string | null) => void;
  setMapViewMode: (mode: 'light' | 'dark' | 'satellite' | 'traffic') => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: string) => void;
  triggerEmergency: (tripId: string) => void;
  dismissAlert: (alertId: string) => void;
  reassignVehicle: (tripId: string, newVehicleNo: string) => void;
  simulateGpsMovement: () => void;
}

export const useTrackingStore = create<TrackingState>((set) => ({
  selectedTripId: null,
  mapViewMode: 'dark',
  isReplayingRoute: false,
  searchQuery: '',
  statusFilter: 'All',
  alerts: [
    {
      id: 'ALT-401',
      vehicleNumber: 'GJ-01-XX-4932',
      driverName: 'Vikas Patel',
      type: 'Route Deviation',
      message: 'Vehicle deviated 4.2km from national corridor NH-48.',
      time: '10:02 AM',
      severity: 'critical',
      read: false,
    },
    {
      id: 'ALT-402',
      vehicleNumber: 'PB-65-AZ-9021',
      driverName: 'Manpreet Singh',
      type: 'Unauthorized Stop',
      message: 'Vehicle idle for 42 mins at unmapped highway location.',
      time: '09:45 AM',
      severity: 'warning',
      read: false,
    },
    {
      id: 'ALT-403',
      vehicleNumber: 'UP-78-TY-4502',
      driverName: 'Rajesh Mishra',
      type: 'Vehicle Offline',
      message: 'GPS tracker telemetry lost in mountainous transit corridor.',
      time: '09:12 AM',
      severity: 'critical',
      read: false,
    }
  ],
  trips: [
    {
      id: 'TRIP-701',
      vehicleNumber: 'DL-01-MA-5544',
      driverName: 'Suresh Khanna',
      driverPhone: '+91 98765 43210',
      transporter: 'Delhi Roadlines',
      status: 'In Transit',
      speed: 68,
      eta: '2h 15m',
      origin: { name: 'Azadpur Plant, Delhi', lat: 28.7159, lng: 77.1694 },
      destination: { name: 'Bhiwandi Depot, Mumbai', lat: 19.2813, lng: 73.0483 },
      currentIndex: 0,
      // Dynamic route coordinate steps between Delhi and Mumbai
      routeCoords: [
        { lat: 28.7159, lng: 77.1694 }, // Delhi
        { lat: 26.9124, lng: 75.7873 }, // Jaipur
        { lat: 24.5854, lng: 73.7125 }, // Udaipur
        { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
        { lat: 21.1702, lng: 72.8311 }, // Surat
        { lat: 19.2813, lng: 73.0483 }  // Mumbai
      ],
      currentCoords: { lat: 28.7159, lng: 77.1694 },
      stops: [
        { name: 'Kothputli Toll Checkpoint', duration: '15 mins', lat: 27.7088, lng: 76.2163, idle: false, engineOff: false },
        { name: 'Udaipur Highway Stop', duration: '45 mins', lat: 24.5854, lng: 73.7125, idle: true, engineOff: true }
      ],
      fuel: 82,
      lastUpdated: 'Just now',
      timeline: [
        { time: '04:00 AM', event: 'Dispatched from Biofactor Azadpur Plant', status: 'success' },
        { time: '06:15 AM', event: 'Passed Kothputli Toll Checkpoint', status: 'info' },
        { time: '08:30 AM', event: 'Routine stoppage at Jaipur Corridor', status: 'info' }
      ],
      deviationAlert: false,
      unauthorizedStop: false,
      idleTime: '0 mins',
      geofences: [
        { name: 'Azadpur Plant Zone', radius: 1000, lat: 28.7159, lng: 77.1694, inside: false },
        { name: 'Bhiwandi Depot Zone', radius: 1500, lat: 19.2813, lng: 73.0483, inside: false }
      ]
    },
    {
      id: 'TRIP-702',
      vehicleNumber: 'GJ-01-XX-4932',
      driverName: 'Vikas Patel',
      driverPhone: '+91 97234 56789',
      transporter: 'FastFreight Solutions',
      status: 'Delayed',
      speed: 0,
      eta: 'Delayed by 1h 45m',
      origin: { name: 'Vatva Warehouse, Ahmedabad', lat: 22.9602, lng: 72.6315 },
      destination: { name: 'Chinchwad Plant, Pune', lat: 18.6298, lng: 73.7997 },
      currentIndex: 2,
      routeCoords: [
        { lat: 22.9602, lng: 72.6315 }, // Ahmedabad
        { lat: 21.1702, lng: 72.8311 }, // Surat
        { lat: 20.3893, lng: 72.9099 }, // Unplanned deviation waypoint
        { lat: 19.0760, lng: 72.8777 }, // Mumbai
        { lat: 18.6298, lng: 73.7997 }  // Pune
      ],
      currentCoords: { lat: 20.3893, lng: 72.9099 }, // Stopped off-route
      stops: [
        { name: 'Surat Bypass Toll plaza', duration: '20 mins', lat: 21.1702, lng: 72.8311, idle: false, engineOff: false },
        { name: 'Unauthorized Vapi Hub stop', duration: '1h 10m', lat: 20.3893, lng: 72.9099, idle: true, engineOff: true }
      ],
      fuel: 48,
      lastUpdated: '2 mins ago',
      timeline: [
        { time: 'Yesterday', event: 'Dispatched from Vatva Warehouse', status: 'success' },
        { time: '11:45 PM', event: 'Crossed Surat Bypass Corridor', status: 'info' },
        { time: '10:02 AM', event: 'CRITICAL: Route Deviation Detected near Vapi', status: 'danger' }
      ],
      deviationAlert: true,
      unauthorizedStop: true,
      idleTime: '1h 10m',
      geofences: [
        { name: 'Vatva Warehouse Zone', radius: 800, lat: 22.9602, lng: 72.6315, inside: false },
        { name: 'Chinchwad Plant Zone', radius: 1000, lat: 18.6298, lng: 73.7997, inside: false }
      ]
    },
    {
      id: 'TRIP-703',
      vehicleNumber: 'PB-65-AZ-9021',
      driverName: 'Manpreet Singh',
      driverPhone: '+91 99123 44556',
      transporter: 'SafeWay Express',
      status: 'Idle',
      speed: 0,
      eta: '5h 10m',
      origin: { name: 'Derabassi Warehouse, Chandigarh', lat: 30.6830, lng: 76.8459 },
      destination: { name: 'Kundli Border, Delhi', lat: 28.8788, lng: 77.1293 },
      currentIndex: 1,
      routeCoords: [
        { lat: 30.6830, lng: 76.8459 }, // Chandigarh
        { lat: 29.9695, lng: 76.8198 }, // Kurukshetra (stopped here)
        { lat: 29.3989, lng: 76.9685 }, // Panipat
        { lat: 28.8788, lng: 77.1293 }  // Delhi
      ],
      currentCoords: { lat: 29.9695, lng: 76.8198 },
      stops: [
        { name: 'Kurukshetra Dhaba Stop', duration: '42 mins', lat: 29.9695, lng: 76.8198, idle: true, engineOff: false }
      ],
      fuel: 65,
      lastUpdated: '1 min ago',
      timeline: [
        { time: '07:30 AM', event: 'Trip Initiated from Derabassi Depot', status: 'success' },
        { time: '09:42 AM', event: 'Vehicle stopped near Kurukshetra Highway', status: 'warning' }
      ],
      deviationAlert: false,
      unauthorizedStop: true,
      idleTime: '42 mins',
      geofences: [
        { name: 'Derabassi Warehouse Zone', radius: 900, lat: 30.6830, lng: 76.8459, inside: false },
        { name: 'Kundli Border Zone', radius: 1200, lat: 28.8788, lng: 77.1293, inside: false }
      ]
    },
    {
      id: 'TRIP-704',
      vehicleNumber: 'UP-78-TY-4502',
      driverName: 'Rajesh Mishra',
      driverPhone: '+91 94150 12345',
      transporter: 'Reliable Cargo Services',
      status: 'Offline',
      speed: 0,
      eta: 'Unknown',
      origin: { name: 'Panki Plant, Kanpur', lat: 26.4499, lng: 80.2078 },
      destination: { name: 'Dankuni Depot, Kolkata', lat: 22.6800, lng: 88.3000 },
      currentIndex: 1,
      routeCoords: [
        { lat: 26.4499, lng: 80.2078 }, // Kanpur
        { lat: 25.3176, lng: 82.9739 }, // Varanasi (Offline here)
        { lat: 23.7957, lng: 86.4304 }, // Dhanbad
        { lat: 22.6800, lng: 88.3000 }  // Kolkata
      ],
      currentCoords: { lat: 25.3176, lng: 82.9739 },
      stops: [
        { name: 'Varanasi Logistics Gate', duration: '30 mins', lat: 25.3176, lng: 82.9739, idle: false, engineOff: false }
      ],
      fuel: 90,
      lastUpdated: '1h ago',
      timeline: [
        { time: 'Yesterday', event: 'Loaded and cleared at Kanpur Panki plant', status: 'success' },
        { time: '09:12 AM', event: 'GPS Tracker dropped telemetry signal', status: 'danger' }
      ],
      deviationAlert: false,
      unauthorizedStop: false,
      idleTime: '0 mins',
      geofences: [
        { name: 'Panki Plant Zone', radius: 1000, lat: 26.4499, lng: 80.2078, inside: false },
        { name: 'Dankuni Depot Zone', radius: 1500, lat: 22.6800, lng: 88.3000, inside: false }
      ]
    }
  ],
  setSelectedTripId: (id) => set({ selectedTripId: id }),
  setMapViewMode: (mode) => set({ mapViewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  dismissAlert: (alertId) => set((state) => ({
    alerts: state.alerts.filter((a) => a.id !== alertId)
  })),
  triggerEmergency: (tripId) => set((state) => {
    toast?.({
      title: "SOS Alert Dispatched",
      description: "Emergency responders and local depot notified instantly.",
      variant: "destructive"
    });
    return {
      trips: state.trips.map((t) => {
        if (t.id === tripId) {
          return {
            ...t,
            status: 'Delayed' as const,
            timeline: [
              { time: 'Just Now', event: 'CRITICAL: SOS Triggered by Administrative Tower', status: 'danger' },
              ...t.timeline
            ]
          };
        }
        return t;
      })
    };
  }),
  reassignVehicle: (tripId, newVehicleNo) => set((state) => ({
    trips: state.trips.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          vehicleNumber: newVehicleNo,
          timeline: [
            { time: 'Just Now', event: `Vehicle reassigned to ${newVehicleNo}`, status: 'info' },
            ...t.timeline
          ]
        };
      }
      return t;
    })
  })),
  simulateGpsMovement: () => set((state) => {
    const updatedTrips = state.trips.map((trip) => {
      // Simulate movement for 'In Transit' vehicles
      if (trip.status === 'In Transit') {
        const nextIndex = (trip.currentIndex + 1) % trip.routeCoords.length;
        const nextCoords = trip.routeCoords[nextIndex];
        
        // Randomly calculate speed fluctuate around 60-75 km/h
        const simulatedSpeed = Math.floor(60 + Math.random() * 15);
        
        // Countdowns fuel slowly
        const nextFuel = Math.max(5, trip.fuel - 1);

        // Update ETA string
        const remainingHours = Math.max(1, trip.routeCoords.length - nextIndex);
        const nextEta = `${remainingHours}h ${Math.floor(10 + Math.random() * 45)}m`;

        return {
          ...trip,
          currentIndex: nextIndex,
          currentCoords: nextCoords,
          speed: simulatedSpeed,
          fuel: nextFuel,
          eta: nextEta,
          lastUpdated: 'Just now',
        };
      }
      return trip;
    });

    return { trips: updatedTrips };
  })
}));

// Safe references to toast hook
let toast: any = null;
export const injectToastHook = (toastHook: any) => {
  toast = toastHook;
};
