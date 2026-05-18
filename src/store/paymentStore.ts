import { create } from 'zustand';
import { useLoadStore } from './loadStore';

export interface PaymentEntry {
  paymentId: string;
  loadId: string;
  transporter: string;
  amount: number;
  penalty: number;
  tax: number;
  extraCharges: number;
  finalAmount: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Under Review' | 'Released';
  createdAt: string;
  invoiceId: string;
  paymentMethod: 'Bank Transfer' | 'UPI' | 'RTGS' | 'NEFT';
}

interface PaymentState {
  payments: PaymentEntry[];
  addPayment: (payment: Omit<PaymentEntry, 'paymentId' | 'invoiceId' | 'createdAt'>) => void;
  releasePayment: (paymentId: string) => void;
  updatePaymentStatus: (paymentId: string, status: PaymentEntry['status']) => void;
  syncPaymentsFromLoads: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [
    {
      paymentId: "PAY-8801",
      loadId: "LD-1001",
      transporter: "Delhi Roadlines",
      amount: 55000,
      penalty: 2000,
      tax: 2750,
      extraCharges: 1000,
      finalAmount: 56750,
      status: "Released",
      createdAt: "2026-05-15",
      invoiceId: "INV-1001",
      paymentMethod: "RTGS"
    },
    {
      paymentId: "PAY-8802",
      loadId: "LD-1002",
      transporter: "SafeWay Express",
      amount: 27000,
      penalty: 0,
      tax: 1350,
      extraCharges: 0,
      finalAmount: 28350,
      status: "Pending",
      createdAt: "2026-05-17",
      invoiceId: "INV-1002",
      paymentMethod: "Bank Transfer"
    }
  ],

  addPayment: (payment) => {
    const idSuffix = Math.floor(1000 + Math.random() * 9000);
    const newEntry: PaymentEntry = {
      ...payment,
      paymentId: `PAY-${idSuffix}`,
      invoiceId: `INV-${idSuffix}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    set({ payments: [newEntry, ...get().payments] });
  },

  releasePayment: (paymentId) => {
    set({
      payments: get().payments.map(p => 
        p.paymentId === paymentId ? { ...p, status: 'Released' as const } : p
      )
    });
  },

  updatePaymentStatus: (paymentId, status) => {
    set({
      payments: get().payments.map(p => 
        p.paymentId === paymentId ? { ...p, status } : p
      )
    });
  },

  syncPaymentsFromLoads: () => {
    const loads = useLoadStore.getState().loads;
    const completedLoads = loads.filter(l => l.status === 'Completed');
    const existingLoadIds = get().payments.map(p => p.loadId);

    completedLoads.forEach(load => {
      if (!existingLoadIds.includes(load.id)) {
        const freight = load.totalFreight || 0;
        const penalty = load.tonnes > 25 ? 2000 : 0; // delay/shortage calculation
        const tax = Math.round(freight * 0.05); // 5% GST
        const extraCharges = 0;
        const finalAmount = freight + tax + extraCharges - penalty;

        get().addPayment({
          loadId: load.id,
          transporter: load.assignedTransporter?.companyName || 'Delhi Roadlines',
          amount: freight,
          penalty,
          tax,
          extraCharges,
          finalAmount,
          status: 'Pending',
          paymentMethod: 'Bank Transfer'
        });
      }
    });
  }
}));
