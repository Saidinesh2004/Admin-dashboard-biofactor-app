import { create } from 'zustand';

export interface TransporterNotification {
  id: string;
  loadId: string;
  type: 'Assignment' | 'CounterOffer' | 'Rejection';
  message: string;
  createdAt: number;
  read: boolean;
}

export type DocumentStatus = 'Pending' | 'Verified' | 'Rejected' | 'Expired' | 'Missing';

export interface TransporterDoc {
  status: DocumentStatus;
  remarks: string;
  fileUrl: string;
  expiryDate?: string;
}

export interface TransporterProfile {
  id: string;
  ownerName: string;
  companyName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  district: string;
  state: string;
  fleetSize: number;
  preferredRoutes: string[];
  vehicleTypes: string[];
  panNumber: string;
  gstNumber: string;
  bankName: string;
  bankAccount: string;
  ifsc: string;
  upiId: string;
  status: 'Pending' | 'Approved' | 'Under Review' | 'Rejected' | 'Blacklisted';
  documents: {
    aadhaar: TransporterDoc;
    panCard: TransporterDoc;
    gstCert: TransporterDoc;
    cancelledCheque: TransporterDoc;
    vehicleRc: TransporterDoc;
    insurance: TransporterDoc;
    fitnessCert: TransporterDoc;
    pollutionCert: TransporterDoc;
    drivingLicense: TransporterDoc;
    vehiclePhotos: TransporterDoc;
  };
}

interface TransporterState {
  transporters: TransporterProfile[];
  notifications: TransporterNotification[];
  addNotification: (loadId: string, type: TransporterNotification['type'], message: string) => void;
  markNotificationsAsRead: () => void;
  addTransporter: (profile: TransporterProfile) => void;
  updateTransporter: (id: string, updates: Partial<TransporterProfile>) => void;
  verifyDocument: (transporterId: string, docKey: keyof TransporterProfile['documents'], status: DocumentStatus, remarks: string) => void;
  blacklistTransporter: (id: string) => void;
}

export const useTransporterStore = create<TransporterState>((set, get) => ({
  notifications: [],
  transporters: [
    {
      id: 'TR-1001',
      ownerName: 'Suresh Khanna',
      companyName: 'Delhi Roadlines',
      mobile: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      email: 'suresh@delhiroadlines.com',
      address: '22 G.T. Road, Azadpur Industrial Area',
      city: 'Delhi',
      district: 'North West Delhi',
      state: 'Delhi',
      fleetSize: 45,
      preferredRoutes: ['Delhi to Mumbai', 'Delhi to Jaipur', 'Delhi to Ahmedabad'],
      vehicleTypes: ['14-Wheeler Taurus', '20-Ton Open Truck', '32ft Container Multi-axle'],
      panNumber: 'AAAPK2293L',
      gstNumber: '07AAAPK2293L1Z4',
      bankName: 'State Bank of India',
      bankAccount: '300224859012',
      ifsc: 'SBIN0001032',
      upiId: 'delhiroad@sbi',
      status: 'Approved',
      documents: {
        aadhaar: { status: 'Verified', remarks: 'Aadhaar UID Match Verified', fileUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800' },
        panCard: { status: 'Verified', remarks: 'NSDL Tax Database Match', fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' },
        gstCert: { status: 'Verified', remarks: 'GST Portal Status Active', fileUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800' },
        cancelledCheque: { status: 'Verified', remarks: 'MICR Code Matched Account', fileUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800' },
        vehicleRc: { status: 'Verified', remarks: 'Vahan Portal Database Match', fileUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800' },
        insurance: { status: 'Verified', remarks: 'Policy Premium Paid', fileUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', expiryDate: '2027-02-15' },
        fitnessCert: { status: 'Verified', remarks: 'RTO Fitness Valid', fileUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', expiryDate: '2026-11-20' },
        pollutionCert: { status: 'Verified', remarks: 'PUC Under Limits', fileUrl: 'https://images.unsplash.com/photo-1530521951940-ad08c2873af7?w=800', expiryDate: '2026-09-12' },
        drivingLicense: { status: 'Verified', remarks: 'Commercial HMV License Valid', fileUrl: 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=800', expiryDate: '2029-05-18' },
        vehiclePhotos: { status: 'Verified', remarks: 'Clear High-Res Fleet Verification', fileUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800' }
      }
    },
    {
      id: 'TR-1002',
      ownerName: 'Manpreet Singh',
      companyName: 'SafeWay Express',
      mobile: '+91 99123 44556',
      whatsapp: '+91 99123 44556',
      email: 'manpreet@safewayexpress.com',
      address: 'Plot 414, Sector 23, Transport Nagar',
      city: 'Chandigarh',
      district: 'Chandigarh',
      state: 'Punjab',
      fleetSize: 18,
      preferredRoutes: ['Chandigarh to Delhi', 'Delhi to Ludhiana', 'Chandigarh to Jammu'],
      vehicleTypes: ['10-Ton Container Truck', 'Bolero PickUp Single axle'],
      panNumber: 'BBYPS5430K',
      gstNumber: '03BBYPS5430K2Z9',
      bankName: 'HDFC Bank',
      bankAccount: '50100412348509',
      ifsc: 'HDFC0000214',
      upiId: 'safeway@hdfc',
      status: 'Under Review',
      documents: {
        aadhaar: { status: 'Verified', remarks: 'Aadhaar Verified', fileUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800' },
        panCard: { status: 'Verified', remarks: 'PAN Verified', fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' },
        gstCert: { status: 'Verified', remarks: 'GST Verified', fileUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800' },
        cancelledCheque: { status: 'Verified', remarks: 'Cheque Verified', fileUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800' },
        vehicleRc: { status: 'Verified', remarks: 'RC Verified', fileUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800' },
        insurance: { status: 'Expired', remarks: 'Policy Expired 2 Days Ago!', fileUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', expiryDate: '2026-05-16' },
        fitnessCert: { status: 'Verified', remarks: 'Fitness Valid', fileUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', expiryDate: '2026-12-05' },
        pollutionCert: { status: 'Expired', remarks: 'PUC certificate expired!', fileUrl: 'https://images.unsplash.com/photo-1530521951940-ad08c2873af7?w=800', expiryDate: '2026-05-10' },
        drivingLicense: { status: 'Verified', remarks: 'DL Valid', fileUrl: 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=800', expiryDate: '2030-01-10' },
        vehiclePhotos: { status: 'Verified', remarks: 'Verified Photos', fileUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800' }
      }
    },
    {
      id: 'TR-1003',
      ownerName: 'Vikas Patel',
      companyName: 'FastFreight Solutions',
      mobile: '+91 97234 56789',
      whatsapp: '+91 97234 56789',
      email: 'vikas@fastfreight.com',
      address: 'G-15, Transport Plaza, Narol',
      city: 'Ahmedabad',
      district: 'Ahmedabad',
      state: 'Gujarat',
      fleetSize: 12,
      preferredRoutes: ['Ahmedabad to Mumbai', 'Ahmedabad to Pune', 'Mumbai to Delhi'],
      vehicleTypes: ['22ft Container', '14-Wheeler Taurus'],
      panNumber: 'CCCPY1124M',
      gstNumber: '24CCCPY1124M1Z8',
      bankName: 'ICICI Bank',
      bankAccount: '002405012485',
      ifsc: 'ICIC0000024',
      upiId: 'fastfreight@icici',
      status: 'Pending',
      documents: {
        aadhaar: { status: 'Pending', remarks: 'Pending Admin verification', fileUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800' },
        panCard: { status: 'Pending', remarks: 'Pending Admin verification', fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' },
        gstCert: { status: 'Pending', remarks: 'Pending verification', fileUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800' },
        cancelledCheque: { status: 'Pending', remarks: 'Cheque Pending', fileUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800' },
        vehicleRc: { status: 'Pending', remarks: 'RC Pending', fileUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800' },
        insurance: { status: 'Pending', remarks: 'Pending verification', fileUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', expiryDate: '2027-01-20' },
        fitnessCert: { status: 'Pending', remarks: 'Pending verification', fileUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', expiryDate: '2026-10-15' },
        pollutionCert: { status: 'Pending', remarks: 'Pending verification', fileUrl: 'https://images.unsplash.com/photo-1530521951940-ad08c2873af7?w=800', expiryDate: '2026-08-30' },
        drivingLicense: { status: 'Pending', remarks: 'Pending verification', fileUrl: 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=800', expiryDate: '2028-12-15' },
        vehiclePhotos: { status: 'Pending', remarks: 'Pending verification', fileUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800' }
      }
    },
    {
      id: 'TR-1004',
      ownerName: 'Rajesh Mishra',
      companyName: 'Reliable Cargo Services',
      mobile: '+91 94150 12345',
      whatsapp: '+91 94150 12345',
      email: 'rajesh@reliablecargo.com',
      address: 'Mishra Transport Hub, Transport Nagar',
      city: 'Kanpur',
      district: 'Kanpur Nagar',
      state: 'Uttar Pradesh',
      fleetSize: 30,
      preferredRoutes: ['Kanpur to Delhi', 'Kanpur to Kolkata', 'Kanpur to Lucknow'],
      vehicleTypes: ['20-Ton Open Truck', '10-Ton Container Truck'],
      panNumber: 'EEEMP4422D',
      gstNumber: '09EEEMP4422D1Z0',
      bankName: 'Axis Bank',
      bankAccount: '91201004509124',
      ifsc: 'UTIB0000050',
      upiId: 'reliable@axis',
      status: 'Blacklisted',
      documents: {
        aadhaar: { status: 'Rejected', remarks: 'Fraudulent ID detected', fileUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800' },
        panCard: { status: 'Rejected', remarks: 'PAN Mismatch', fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' },
        gstCert: { status: 'Rejected', remarks: 'GST Blacklisted', fileUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800' },
        cancelledCheque: { status: 'Rejected', remarks: 'Cheque Rejected', fileUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800' },
        vehicleRc: { status: 'Rejected', remarks: 'RC Blacklisted', fileUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800' },
        insurance: { status: 'Rejected', remarks: 'Expired policy', fileUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', expiryDate: '2025-01-20' },
        fitnessCert: { status: 'Rejected', remarks: 'Fitness Expired', fileUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', expiryDate: '2025-05-15' },
        pollutionCert: { status: 'Rejected', remarks: 'Pollution Violation', fileUrl: 'https://images.unsplash.com/photo-1530521951940-ad08c2873af7?w=800', expiryDate: '2025-08-30' },
        drivingLicense: { status: 'Rejected', remarks: 'DL Suspended', fileUrl: 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=800', expiryDate: '2025-12-15' },
        vehiclePhotos: { status: 'Rejected', remarks: 'Rejected Photos', fileUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800' }
      }
    }
  ],

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
  },

  addTransporter: (profile) => {
    set({ transporters: [...get().transporters, profile] });
  },

  updateTransporter: (id, updates) => {
    set({
      transporters: get().transporters.map(tr => 
        tr.id === id ? { ...tr, ...updates } : tr
      )
    });
  },

  verifyDocument: (transporterId, docKey, status, remarks) => {
    set({
      transporters: get().transporters.map(tr => {
        if (tr.id === transporterId) {
          const updatedDocs = {
            ...tr.documents,
            [docKey]: {
              ...tr.documents[docKey],
              status,
              remarks
            }
          };

          // Re-evaluate general profile status based on documents check!
          // If any document is rejected -> status becomes "Under Review" or "Rejected"
          // If all documents are verified -> status becomes "Approved"
          const docValues = Object.values(updatedDocs);
          const hasRejected = docValues.some(d => d.status === 'Rejected');
          const hasPending = docValues.some(d => d.status === 'Pending' || d.status === 'Missing');
          const hasExpired = docValues.some(d => d.status === 'Expired');
          
          let generalStatus = tr.status;
          if (tr.status !== 'Blacklisted') {
            if (hasRejected) {
              generalStatus = 'Under Review';
            } else if (hasExpired) {
              generalStatus = 'Under Review';
            } else if (!hasPending) {
              generalStatus = 'Approved';
            } else {
              generalStatus = 'Pending';
            }
          }

          return {
            ...tr,
            status: generalStatus,
            documents: updatedDocs
          };
        }
        return tr;
      })
    });
  },

  blacklistTransporter: (id) => {
    set({
      transporters: get().transporters.map(tr => 
        tr.id === id ? { ...tr, status: 'Blacklisted' as const } : tr
      )
    });
  }
}));
