import { create } from 'zustand';
import { loadService, type Load, type Bid, type Transporter } from '@/services/loadService';

export type { Load, Bid, Transporter };

// Top 7 Cheapest Mock Bids Generator
const generateMockBids = (load: Load): Bid[] => {
  const transporters = [
    { name: 'FastFreight Solutions', owner: 'Ramesh Sharma', fleetSize: 45, trips: 1250, exp: 12, rating: 4.8 },
    { name: 'SafeWay Express', owner: 'Vikram Singh', fleetSize: 32, trips: 840, exp: 8, rating: 4.6 },
    { name: 'BlueDart Road Carrier', owner: 'Anil Mehta', fleetSize: 110, trips: 4200, exp: 15, rating: 4.9 },
    { name: 'Agarwal Premium Movers', owner: 'Suresh Agarwal', fleetSize: 60, trips: 2300, exp: 10, rating: 4.7 },
    { name: 'VRL Logistics Ltd', owner: 'Vijay Sankeshwar', fleetSize: 250, trips: 9800, exp: 20, rating: 4.9 },
    { name: 'Gati Freight Services', owner: 'Rajesh Gupta', fleetSize: 85, trips: 3100, exp: 14, rating: 4.5 },
    { name: 'TCI Transport Corporation', owner: 'Mahendra Agarwal', fleetSize: 150, trips: 6700, exp: 18, rating: 4.8 },
    { name: 'Delhi Roadlines', owner: 'Sanjay Dutt', fleetSize: 18, trips: 450, exp: 5, rating: 4.2 },
    { name: 'Speedex Logistics', owner: 'Mohit Chawla', fleetSize: 22, trips: 620, exp: 6, rating: 4.4 }
  ];

  // Pick 7 unique transporters randomly and generate competitive rates
  const shuffled = [...transporters].sort(() => 0.5 - Math.random()).slice(0, 7);
  const vehicleTypes = ['22-Tonne Open High Side', '19-Tonne Closed Box Container', '32-Tonne Open Trailer', '15-Tonne Triaxle', '22-Tonne Multi-axle'];

  const bids: Bid[] = shuffled.map((t, idx) => {
    // Generate a price per tonne within -15% to +10% of the load's rate
    const percentageVariation = -0.15 + Math.random() * 0.25; 
    const pricePerTonne = Math.round(load.ratePerTonne * (1 + percentageVariation));
    const bidAmount = Math.round(pricePerTonne * load.tonnes);
    const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    const etaHours = Math.floor(6 + Math.random() * 36);
    
    const verificationOptions: ('KYC Verified' | 'Insurance Valid' | 'Trusted Transporter' | 'New Bidder')[][] = [
      ['KYC Verified', 'Insurance Valid', 'Trusted Transporter'],
      ['KYC Verified', 'Insurance Valid'],
      ['KYC Verified', 'Insurance Valid', 'Trusted Transporter'],
      ['KYC Verified', 'Insurance Valid', 'New Bidder'],
      ['KYC Verified', 'Insurance Valid', 'Trusted Transporter'],
      ['KYC Verified', 'Insurance Valid'],
      ['KYC Verified', 'Insurance Valid', 'Trusted Transporter']
    ];

    return {
      id: `BID-2026-${1000 + Math.floor(Math.random() * 9000)}`,
      rank: 0,
      transporterName: t.name,
      vehicleType,
      bidAmount,
      pricePerTonne,
      eta: `${etaHours} hrs`,
      driverRating: t.rating,
      experienceYears: t.exp,
      verificationStatus: verificationOptions[idx % verificationOptions.length],
      status: 'Pending',
      transporterDetails: {
        companyName: t.name,
        ownerName: t.owner,
        fleetSize: t.fleetSize,
        completedTrips: t.trips,
        insuranceValidity: '31 Dec 2026',
        kycStatus: 'Verified',
        rating: t.rating,
        experienceYears: t.exp
      }
    };
  });

  // Sort by bidAmount ascending
  const sortedBids = bids.sort((a, b) => a.bidAmount - b.bidAmount);
  
  // Assign ranks
  return sortedBids.map((b, index) => ({
    ...b,
    rank: index + 1
  }));
};

interface LoadState {
  loads: Load[];
  addLoad: (load: Load) => void;
  updateLoad: (id: string, updatedFields: Partial<Load>) => void;
  deleteLoad: (id: string) => void;
  fetchLoads: () => void;
  approveBid: (loadId: string, bidId: string) => void;
  rejectBid: (loadId: string, bidId: string) => void;
  negotiateBid: (loadId: string, bidId: string, counterOffer: number, remarks: string) => void;
  simulateNewBid: (loadId: string) => void;
}

const getInitialLoads = (): Load[] => {
  const initial = loadService.getLoads();
  return initial.map(load => {
    if (!load.bids || load.bids.length === 0) {
      return {
        ...load,
        bids: generateMockBids(load)
      };
    }
    return load;
  });
};

export const useLoadStore = create<LoadState>((set, get) => ({
  loads: typeof window !== 'undefined' ? getInitialLoads() : [],
  
  fetchLoads: () => {
    const loads = getInitialLoads();
    set({ loads });
  },
  
  addLoad: (load) => {
    const loadWithBids = {
      ...load,
      bids: load.bids && load.bids.length > 0 ? load.bids : generateMockBids(load)
    };
    const updatedLoads = [loadWithBids, ...get().loads];
    set({ loads: updatedLoads });
    loadService.saveLoads(updatedLoads);
  },
  
  updateLoad: (id, updatedFields) => {
    const updatedLoads = get().loads.map((l) =>
      l.id === id ? { ...l, ...updatedFields } : l
    );
    set({ loads: updatedLoads });
    loadService.saveLoads(updatedLoads);
  },
  
  deleteLoad: (id) => {
    const updatedLoads = get().loads.filter((l) => l.id !== id);
    set({ loads: updatedLoads });
    loadService.saveLoads(updatedLoads);
  },

  approveBid: (loadId, bidId) => {
    const updatedLoads = get().loads.map((l) => {
      if (l.id === loadId) {
        const approvedBid = l.bids?.find(b => b.id === bidId);
        if (!approvedBid) return l;

        const updatedBids = l.bids?.map(b => {
          if (b.id === bidId) {
            return { ...b, status: 'Approved' as const };
          }
          return { ...b, status: 'Rejected' as const };
        }) || [];

        return {
          ...l,
          status: 'Assigned' as const,
          bids: updatedBids,
          assignedTransporter: approvedBid.transporterDetails,
          tripId: `TRIP-2026-${Math.floor(100000 + Math.random() * 900000)}`
        };
      }
      return l;
    });
    set({ loads: updatedLoads });
    loadService.saveLoads(updatedLoads);
  },

  rejectBid: (loadId, bidId) => {
    const updatedLoads = get().loads.map((l) => {
      if (l.id === loadId) {
        const updatedBids = l.bids?.map(b => {
          if (b.id === bidId) {
            return { ...b, status: 'Rejected' as const };
          }
          return b;
        }) || [];
        return {
          ...l,
          bids: updatedBids
        };
      }
      return l;
    });
    set({ loads: updatedLoads });
    loadService.saveLoads(updatedLoads);
  },

  negotiateBid: (loadId, bidId, counterOffer, remarks) => {
    const updatedLoads = get().loads.map((l) => {
      if (l.id === loadId) {
        const updatedBids = l.bids?.map(b => {
          if (b.id === bidId) {
            return { 
              ...b, 
              status: 'Negotiating' as const,
              bidAmount: counterOffer, // Counter offer becomes current bid amount temporarily or shown as counter offer
              transporterDetails: {
                ...b.transporterDetails,
                remarks // Save remarks inside
              }
            };
          }
          return b;
        }) || [];
        return {
          ...l,
          bids: updatedBids
        };
      }
      return l;
    });
    set({ loads: updatedLoads });
    loadService.saveLoads(updatedLoads);
  },

  simulateNewBid: (loadId) => {
    const transporters = [
      { name: 'Express Freight Corp', owner: 'Vijay Kumar', fleetSize: 15, trips: 320, exp: 4, rating: 4.1 },
      { name: 'Speedy Logistics', owner: 'Arjun Sen', fleetSize: 28, trips: 710, exp: 7, rating: 4.4 },
      { name: 'Kargotech Logistics', owner: 'Devendra Patel', fleetSize: 50, trips: 1900, exp: 9, rating: 4.6 }
    ];

    const updatedLoads = get().loads.map((l) => {
      if (l.id === loadId && l.status === 'Open' && l.bids && l.bids.length > 0) {
        // Pick a random transporter
        const randomTransporter = transporters[Math.floor(Math.random() * transporters.length)];
        
        // Generate an extremely cheap bid to trigger ranking animation!
        const existingCheapestPricePerTonne = Math.min(...l.bids.map(b => b.pricePerTonne));
        const pricePerTonne = Math.round(existingCheapestPricePerTonne * 0.95); // 5% cheaper!
        const bidAmount = pricePerTonne * l.tonnes;
        
        const newBid: Bid = {
          id: `BID-2026-${1000 + Math.floor(Math.random() * 9000)}`,
          rank: 0, // Computed below
          transporterName: randomTransporter.name,
          vehicleType: '22-Tonne Open High Side',
          bidAmount,
          pricePerTonne,
          eta: '12 hrs',
          driverRating: randomTransporter.rating,
          experienceYears: randomTransporter.exp,
          verificationStatus: ['KYC Verified', 'New Bidder'],
          status: 'Pending',
          transporterDetails: {
            companyName: randomTransporter.name,
            ownerName: randomTransporter.owner,
            fleetSize: randomTransporter.fleetSize,
            completedTrips: randomTransporter.trips,
            insuranceValidity: '31 Dec 2026',
            kycStatus: 'Verified',
            rating: randomTransporter.rating,
            experienceYears: randomTransporter.exp
          }
        };

        // Combine and keep top 7
        const allBids = [...l.bids, newBid].sort((a, b) => a.bidAmount - b.bidAmount);
        
        // Take top 7 cheapest
        const top7Bids = allBids.slice(0, 7).map((b, index) => ({
          ...b,
          rank: index + 1
        }));

        return {
          ...l,
          bids: top7Bids
        };
      }
      return l;
    });

    set({ loads: updatedLoads });
    loadService.saveLoads(updatedLoads);
  }
}));
