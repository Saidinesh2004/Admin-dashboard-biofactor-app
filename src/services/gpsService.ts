import { type LatLng } from '@/store/trackingStore';

// Calculate distance between two coordinates in km (Haversine formula)
export function calculateDistance(coord1: LatLng, coord2: LatLng): number {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) * 
    Math.cos(coord2.lat * (Math.PI / 180)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Mock API: Fetch live coordinates
export async function fetchLiveVehicleLocations() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 'success', timestamp: Date.now() });
    }, 300);
  });
}

// Mock API: Detect route deviation from active corridor
export function detectRouteDeviation(current: LatLng, plannedCorridor: LatLng[], maxAllowedKm = 5): { deviated: boolean; distance: number } {
  let minDistance = Infinity;
  
  plannedCorridor.forEach(point => {
    const dist = calculateDistance(current, point);
    if (dist < minDistance) {
      minDistance = dist;
    }
  });

  return {
    deviated: minDistance > maxAllowedKm,
    distance: minDistance
  };
}

// Mock API: Stop detection threshold
export function detectVehicleStop(speed: number, idleMinutes: number): { stopped: boolean; alarmTrigger: boolean } {
  return {
    stopped: speed === 0,
    alarmTrigger: speed === 0 && idleMinutes > 30
  };
}

// Mock API: Calculate ETA based on speed, distance and typical traffic delays
export function calculateETA(distanceRemainingKm: number, currentSpeedKmh: number): string {
  if (currentSpeedKmh <= 0) return 'Delayed';
  const hours = distanceRemainingKm / currentSpeedKmh;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
