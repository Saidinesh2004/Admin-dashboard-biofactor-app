import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BidStatus = 'Pending' | 'Approved' | 'Rejected' | 'Negotiating' | 'Waiting Confirmation'

export interface Bid {
  id: string
  rank: number
  transporterName: string
  bidAmount: number
  pricePerTonne: number
  eta: string
  vehicleType: string
  rating: number
  status: BidStatus
}

export interface Load {
  id: string
  bidId: string
  from: string
  stops?: string[]
  to: string
  product: string
  quantity: number
  rate: number
  totalAmount: number
  date: string
  vehicleType: string
  status: 'Open' | 'Bidding' | 'Approved' | 'Assigned' | 'Completed' | 'Cancelled'
  bids: Bid[]
  createdAt: number
}

interface DashboardState {
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (value: boolean) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (value) => set({ isSidebarCollapsed: value }),
}))

// Initial mock data to ensure dashboard isn't completely empty for first-time viewers
const mockBidsGenerator = (baseRate: number, qty: number): Bid[] => {
  const transporters = ['FastFreight', 'SafeWay Logistics', 'BlueDart Express', 'Agarwal Movers', 'VRL Logistics', 'Gati Express', 'TCI Freight'];
  return transporters.map((t) => {
    const variation = Math.floor(Math.random() * 300) - 150; 
    const pricePerTonne = baseRate + variation;
    const bidAmount = pricePerTonne * qty;
    return {
      id: `BID-${Math.floor(Math.random() * 10000)}`,
      rank: 0,
      transporterName: t,
      bidAmount,
      pricePerTonne,
      eta: `${Math.floor(Math.random() * 24 + 12)} hours`,
      vehicleType: '22-Tonne Open',
      rating: Number((Math.random() * 1 + 4).toFixed(1)),
      status: 'Pending' as BidStatus,
    }
  }).sort((a, b) => a.bidAmount - b.bidAmount).map((b, i) => ({ ...b, rank: i + 1 }));
}

const INITIAL_LOADS: Load[] = [
  { id: 'LD-1001', bidId: 'BF-BID-2026-001', from: 'Kolkata', stops: ['Ranchi'], to: 'Patna', product: 'Rice', quantity: 25, rate: 2200, totalAmount: 55000, date: '2026-05-18', vehicleType: '22-Tonne Open', status: 'Bidding', bids: mockBidsGenerator(2200, 25), createdAt: Date.now() - 100000 },
  { id: 'LD-1002', bidId: 'BF-BID-2026-002', from: 'Nagpur', stops: [], to: 'Hyderabad', product: 'Oranges', quantity: 15, rate: 1800, totalAmount: 27000, date: '2026-05-19', vehicleType: '19-Tonne Closed', status: 'Open', bids: mockBidsGenerator(1800, 15), createdAt: Date.now() - 200000 },
  { id: 'LD-1003', bidId: 'BF-BID-2026-003', from: 'Jalandhar', stops: ['Ambala'], to: 'Delhi', product: 'Wheat', quantity: 30, rate: 1200, totalAmount: 36000, date: '2026-05-17', vehicleType: '32-Tonne Open', status: 'Assigned', bids: mockBidsGenerator(1200, 30).map((b,i) => i===0 ? {...b, status: 'Approved'} : b), createdAt: Date.now() - 300000 },
];

interface LogisticsStore {
  loads: Load[]
  addLoad: (load: Load) => void
  updateLoadStatus: (id: string, status: Load['status']) => void
  updateLoadBids: (id: string, newBids: Bid[]) => void
}

export const useLogisticsStore = create<LogisticsStore>()(
  persist(
    (set) => ({
      loads: INITIAL_LOADS,
      addLoad: (load) => set((state) => ({ loads: [load, ...state.loads] })),
      updateLoadStatus: (id, status) => set((state) => ({
        loads: state.loads.map(l => l.id === id ? { ...l, status } : l)
      })),
      updateLoadBids: (id, newBids) => set((state) => ({
        loads: state.loads.map(l => l.id === id ? { ...l, bids: newBids } : l)
      })),
    }),
    {
      name: 'biofactor-logistics-storage',
    }
  )
)
