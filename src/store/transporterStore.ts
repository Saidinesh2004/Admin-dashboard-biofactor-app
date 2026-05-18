import { create } from 'zustand';

export interface TransporterNotification {
  id: string;
  loadId: string;
  type: 'Assignment' | 'CounterOffer' | 'Rejection';
  message: string;
  createdAt: number;
  read: boolean;
}

interface TransporterState {
  notifications: TransporterNotification[];
  addNotification: (loadId: string, type: TransporterNotification['type'], message: string) => void;
  markNotificationsAsRead: () => void;
}

export const useTransporterStore = create<TransporterState>((set, get) => ({
  notifications: [],
  addNotification: (loadId, type, message) => {
    const newNotif: TransporterNotification = {
      id: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`,
      loadId,
      type,
      message,
      createdAt: Date.now(),
      read: false
    };
    set({ notifications: [newNotif, ...get().notifications] });
  },
  markNotificationsAsRead: () => {
    set({ notifications: get().notifications.map(n => ({ ...n, read: true })) });
  }
}));
