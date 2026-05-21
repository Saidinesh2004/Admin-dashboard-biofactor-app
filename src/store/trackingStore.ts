import { create } from 'zustand';

export type TripStatus = 'Moving' | 'Stopped' | 'Idle' | 'Offline' | 'Delayed';

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
  alerts: [],
  trips: [],
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
      if (trip.status === 'Moving') {
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
