import { create } from 'zustand';
import { loadService, type Load } from '@/services/loadService';

export type { Load };

interface LoadState {
  loads: Load[];
  addLoad: (load: Load) => void;
  updateLoad: (id: string, updatedFields: Partial<Load>) => void;
  deleteLoad: (id: string) => void;
  fetchLoads: () => void;
}

export const useLoadStore = create<LoadState>((set, get) => ({
  loads: typeof window !== 'undefined' ? loadService.getLoads() : [],
  fetchLoads: () => {
    const loads = loadService.getLoads();
    set({ loads });
  },
  addLoad: (load) => {
    const updatedLoads = [load, ...get().loads];
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
  }
}));
