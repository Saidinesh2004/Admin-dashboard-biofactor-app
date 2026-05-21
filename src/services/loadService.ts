export type BidStatus = 'Pending' | 'Approved' | 'Rejected' | 'Negotiating' | 'Selected' | 'Locked' | 'ACCEPTED' | 'REJECTED';

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
  endDate?: string;
  endTime?: string;
  status: 'Open' | 'Assigned & Dispatched' | 'Negotiation In Progress' | 'Awaiting New Bids' | 'Completed';
  createdAt: number;
  bids?: Bid[];
  assignedTransporter?: Transporter;
  tripId?: string;
  assignedVehicle?: string;
  assignedDriver?: string;
  priority?: 'Low' | 'Medium' | 'High';
  negotiationDetails?: {
    counterOffer: number;
    remarks: string;
    validTill: string;
    priority: string;
  };
}

const LOCAL_STORAGE_KEY = 'biofactor-loads-v2';

const INITIAL_LOADS: Load[] = [];


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
