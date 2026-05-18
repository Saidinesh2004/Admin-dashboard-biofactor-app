export type BidStatus = 'Pending' | 'Approved' | 'Rejected' | 'Negotiating' | 'Selected';

export interface Transporter {
  companyName: string;
  ownerName: string;
  fleetSize: number;
  completedTrips: number;
  insuranceValidity: string;
  kycStatus: 'Verified' | 'Pending' | 'Failed';
  rating: number;
  experienceYears: number;
  remarks?: string;
}

export interface Bid {
  id: string;
  rank: number;
  transporterName: string;
  vehicleType: string;
  bidAmount: number;
  pricePerTonne: number;
  eta: string;
  driverRating: number;
  experienceYears: number;
  verificationStatus: ('KYC Verified' | 'Insurance Valid' | 'Trusted Transporter' | 'New Bidder')[];
  status: BidStatus;
  transporterDetails: Transporter;
}

export interface Load {
  id: string;
  bidId: string;
  from: string;
  stops: string[];
  to: string;
  product: string;
  tonnes: number;
  ratePerTonne: number;
  totalFreight: number;
  dispatchDate: string;
  status: 'Open' | 'Assigned' | 'Completed';
  createdAt: number;
  bids?: Bid[];
  assignedTransporter?: Transporter;
  tripId?: string;
}

const LOCAL_STORAGE_KEY = 'biofactor-loads-v2';

const INITIAL_LOADS: Load[] = [
  {
    id: "LD-1001",
    bidId: "BF-BID-2026-101",
    from: "Kolkata",
    stops: ["Ranchi"],
    to: "Patna",
    product: "Rice",
    tonnes: 25,
    ratePerTonne: 2200,
    totalFreight: 55000,
    dispatchDate: "2026-05-18",
    status: "Assigned",
    createdAt: Date.now() - 3600000 * 24 * 3
  },
  {
    id: "LD-1002",
    bidId: "BF-BID-2026-102",
    from: "Nagpur",
    stops: [],
    to: "Hyderabad",
    product: "Oranges",
    tonnes: 15,
    ratePerTonne: 1800,
    totalFreight: 27000,
    dispatchDate: "2026-05-19",
    status: "Open",
    createdAt: Date.now() - 3600000 * 24 * 2
  },
  {
    id: "LD-1003",
    bidId: "BF-BID-2026-103",
    from: "Jalandhar",
    stops: ["Ambala"],
    to: "Delhi",
    product: "Wheat",
    tonnes: 30,
    ratePerTonne: 1200,
    totalFreight: 36000,
    dispatchDate: "2026-05-20",
    status: "Completed",
    createdAt: Date.now() - 3600000 * 24
  },
  {
    id: "LD-1004",
    bidId: "BF-BID-2026-104",
    from: "Hyderabad",
    stops: ["Vijayawada"],
    to: "Chennai",
    product: "Rice",
    tonnes: 20,
    ratePerTonne: 2100,
    totalFreight: 42000,
    dispatchDate: "2026-05-22",
    status: "Open",
    createdAt: Date.now()
  }
];

export const loadService = {
  getLoads: (): Load[] => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_LOADS));
      return INITIAL_LOADS;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing local storage loads:", e);
      return INITIAL_LOADS;
    }
  },
  saveLoads: (loads: Load[]): void => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loads));
  }
};
