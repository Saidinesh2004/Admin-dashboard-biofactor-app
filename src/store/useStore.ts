import { create } from 'zustand'

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

interface Load {
  id: string
  from: string
  to: string
  product: string
  quantity: number
  rate: number
  date: string
  status: 'Open' | 'Bidding' | 'Approved' | 'In Transit' | 'Completed'
  bidCount: number
}

interface LogisticsStore {
  loads: Load[]
  addLoad: (load: Load) => void
  updateLoadStatus: (id: string, status: Load['status']) => void
}

export const useLogisticsStore = create<LogisticsStore>((set) => ({
  loads: [
    { id: 'LD-1001', from: 'Kolkata, WB', to: 'Patna, BR', product: 'Rice', quantity: 25, rate: 2200, date: '2026-05-18', status: 'Bidding', bidCount: 12 },
    { id: 'LD-1002', from: 'Nagpur, MH', to: 'Hyderabad, TS', product: 'Oranges', quantity: 15, rate: 1800, date: '2026-05-19', status: 'Open', bidCount: 4 },
    { id: 'LD-1003', from: 'Jalandhar, PB', to: 'Delhi, DL', product: 'Wheat', quantity: 30, rate: 1200, date: '2026-05-17', status: 'Approved', bidCount: 8 },
  ],
  addLoad: (load) => set((state) => ({ loads: [load, ...state.loads] })),
  updateLoadStatus: (id, status) => set((state) => ({
    loads: state.loads.map(l => l.id === id ? { ...l, status } : l)
  })),
}))
