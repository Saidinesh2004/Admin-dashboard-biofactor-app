import { create } from 'zustand';
import { useTransporterStore } from './transporterStore';

export interface ExtractedTransporter {
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
  validationResult: 'Valid' | 'Missing Data' | 'Duplicate Entry' | 'Needs Review' | 'Invalid Document';
  errors: string[];
}

export interface UploadHistoryItem {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  totalRecords: number;
  successful: number;
  failed: number;
}

interface BulkRegistrationState {
  uploadHistory: UploadHistoryItem[];
  extractedRecords: ExtractedTransporter[];
  isUploading: boolean;
  uploadProgress: number;
  setUploading: (isUploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  mockExtractFiles: (files: File[]) => void;
  updateRecord: (index: number, updates: Partial<ExtractedTransporter>) => void;
  deleteRecord: (index: number) => void;
  submitBulk: (onSuccess: () => void) => void;
}

export const useBulkRegistrationStore = create<BulkRegistrationState>((set, get) => ({
  uploadHistory: [],
  extractedRecords: [],
  isUploading: false,
  uploadProgress: 0,

  setUploading: (isUploading) => set({ isUploading }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),

  mockExtractFiles: (files) => {
    set({ isUploading: true, uploadProgress: 10 });
    
    // Simulate smart OCR parsing process
    const timer1 = setTimeout(() => set({ uploadProgress: 45 }), 600);
    const timer2 = setTimeout(() => set({ uploadProgress: 85 }), 1200);
    const timer3 = setTimeout(() => {
      const parsed: ExtractedTransporter[] = [
        {
          id: '',
          ownerName: 'Kuldeep Yadav',
          companyName: 'Yadav Highway Liners',
          mobile: '+91 95000 11223',
          whatsapp: '+91 95000 11223',
          email: 'kuldeep@yadavliners.com',
          address: 'Shop 2, Transport Nagar, GT Road',
          city: 'Ludhiana',
          district: 'Ludhiana',
          state: 'Punjab',
          fleetSize: 15,
          preferredRoutes: ['Ludhiana to Delhi', 'Delhi to Ludhiana'],
          vehicleTypes: ['20-Ton Open Truck', '10-Ton Container Truck'],
          panNumber: 'YYYPK4422M',
          gstNumber: '03YYYPK4422M1Z5',
          bankName: 'Punjab National Bank',
          bankAccount: '124800201048590',
          ifsc: 'PUNB0124800',
          upiId: 'yadavliners@pnb',
          status: 'Pending',
          validationResult: 'Valid',
          errors: []
        },
        {
          id: '',
          ownerName: 'Amit Patel',
          companyName: 'Gujarat Road Carriers',
          mobile: '+91 98765 43210', // Duplicate mobile check
          whatsapp: '+91 98765 43210',
          email: 'amit@gujaratroad.com',
          address: 'Plot A-14, Narol GIDC',
          city: 'Ahmedabad',
          district: 'Ahmedabad',
          state: 'Gujarat',
          fleetSize: 22,
          preferredRoutes: ['Ahmedabad to Mumbai', 'Ahmedabad to Pune'],
          vehicleTypes: ['32ft Multi-Axle Container'],
          panNumber: 'GGGPK9012L',
          gstNumber: '24GGGPK9012L1Z9',
          bankName: 'Bank of Baroda',
          bankAccount: '01240212485091',
          ifsc: 'BARB0NAROLX',
          upiId: 'gujaratcarriers@barb',
          status: 'Pending',
          validationResult: 'Duplicate Entry',
          errors: ['Mobile Number duplicates Suresh Khanna (TR-1001)']
        },
        {
          id: '',
          ownerName: 'Karthik Rao',
          companyName: 'Deccan Cargo Liners',
          mobile: '+91 88990 12345',
          whatsapp: '+91 88990 12345',
          email: 'karthik@deccancargo', // Invalid email format
          address: 'Transport Center, Peenya',
          city: 'Bengaluru',
          district: 'Bengaluru Urban',
          state: 'Karnataka',
          fleetSize: 8,
          preferredRoutes: ['Bengaluru to Chennai', 'Bengaluru to Hyderabad'],
          vehicleTypes: ['Bolero PickUp Single axle'],
          panNumber: '', // Missing PAN
          gstNumber: '29AAAPK2293L1Z4',
          bankName: 'Canara Bank',
          bankAccount: '1092048590124',
          ifsc: 'CNRB0001092',
          upiId: 'deccancargo@cnrb',
          status: 'Pending',
          validationResult: 'Needs Review',
          errors: ['Invalid Email Format', 'Missing PAN Card Number']
        }
      ];

      set({ 
        extractedRecords: parsed, 
        isUploading: false, 
        uploadProgress: 0,
        uploadHistory: [
          {
            id: `BIMP-${Math.floor(9000 + Math.random() * 1000)}`,
            fileName: files[0].name,
            fileSize: `${Math.round(files[0].size / 1024)} KB`,
            fileType: files[0].name.split('.').pop() || 'xlsx',
            uploadDate: new Date().toISOString().split('T')[0],
            totalRecords: 3,
            successful: 1,
            failed: 2
          },
          ...get().uploadHistory
        ]
      });
    }, 1800);
  },

  updateRecord: (index, updates) => {
    const updated = [...get().extractedRecords];
    updated[index] = { ...updated[index], ...updates };

    const rec = updated[index];
    const errors: string[] = [];
    
    if (!rec.panNumber) errors.push('Missing PAN Card Number');
    if (!rec.email.includes('@') || !rec.email.includes('.')) errors.push('Invalid Email Format');
    
    const existingMobiles = useTransporterStore.getState().transporters.map(t => t.mobile.replace(/\s+/g, ''));
    const cleanMobile = rec.mobile.replace(/\s+/g, '');
    if (existingMobiles.includes(cleanMobile)) {
      errors.push('Mobile Number duplicates active transporter in database');
    }

    rec.errors = errors;
    rec.validationResult = errors.length > 0 ? 'Needs Review' : 'Valid';

    set({ extractedRecords: updated });
  },

  deleteRecord: (index) => {
    set({ extractedRecords: get().extractedRecords.filter((_, idx) => idx !== index) });
  },

  submitBulk: (onSuccess) => {
    const records = get().extractedRecords;
    const invalidRecords = records.filter(r => r.validationResult !== 'Valid');
    
    if (invalidRecords.length > 0) {
      return; 
    }

    const { addTransporter, transporters } = useTransporterStore.getState();
    const lastIdNum = parseInt(transporters[transporters.length - 1].id.split('-')[1]);

    records.forEach((rec, idx) => {
      const nextId = `TR-${lastIdNum + 1 + idx}`;
      
      addTransporter({
        id: nextId,
        ownerName: rec.ownerName,
        companyName: rec.companyName,
        mobile: rec.mobile,
        whatsapp: rec.whatsapp,
        email: rec.email,
        address: rec.address,
        city: rec.city,
        district: rec.district,
        state: rec.state,
        fleetSize: rec.fleetSize,
        preferredRoutes: rec.preferredRoutes,
        vehicleTypes: rec.vehicleTypes,
        panNumber: rec.panNumber,
        gstNumber: rec.gstNumber,
        bankName: rec.bankName,
        bankAccount: rec.bankAccount,
        ifsc: rec.ifsc,
        upiId: rec.upiId,
        status: 'Approved',
        documents: {
          aadhaar: { status: 'Verified', remarks: 'Bulk Imported and Auto-Verified', fileUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800' },
          panCard: { status: 'Verified', remarks: 'Bulk Imported and Auto-Verified', fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' },
          gstCert: { status: 'Verified', remarks: 'Bulk Imported and Auto-Verified', fileUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800' },
          cancelledCheque: { status: 'Verified', remarks: 'Auto-Verified', fileUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800' },
          vehicleRc: { status: 'Verified', remarks: 'Auto-Verified', fileUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800' },
          insurance: { status: 'Verified', remarks: 'Auto-Verified', fileUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', expiryDate: '2027-05-18' },
          fitnessCert: { status: 'Verified', remarks: 'Auto-Verified', fileUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', expiryDate: '2027-05-18' },
          pollutionCert: { status: 'Verified', remarks: 'Auto-Verified', fileUrl: 'https://images.unsplash.com/photo-1530521951940-ad08c2873af7?w=800', expiryDate: '2027-05-18' },
          drivingLicense: { status: 'Verified', remarks: 'Auto-Verified', fileUrl: 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=800', expiryDate: '2027-05-18' },
          vehiclePhotos: { status: 'Verified', remarks: 'Auto-Verified', fileUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800' }
        }
      });
    });

    set({ extractedRecords: [] });
    onSuccess();
  }
}));
