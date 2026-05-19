export interface OCRExtractedData {
  companyName: string;
  ownerName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  fleetSize: number;
  panNumber: string;
  gstNumber: string;
  bankName: string;
  bankAccount: string;
  ifsc: string;
  aadhaarNumber: string;
  aadhaarUrl?: string;
  panUrl?: string;
  gstUrl?: string;
  chequeUrl?: string;
  insuranceUrl?: string;
  rcUrl?: string;
  insuranceExpiry: string;
  rcExpiry: string;
}

export const ocrService = {
  /**
   * Simulates Tesseract OCR processing on uploaded files.
   * Generates mock carrier details based on file type and name.
   */
  extractTransporterData: async (fileName: string, fileSize: string): Promise<OCRExtractedData[]> => {
    // Artificial scanning processing latency (1.5s)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowercaseName = fileName.toLowerCase();

    // 1. If it's a PDF of single transporter (e.g., "delhi_fleet_onboard.pdf")
    if (lowercaseName.includes('delhi') || lowercaseName.includes('fleet')) {
      return [
        {
          companyName: "Delhi Express Logistics",
          ownerName: "Kuldeep Yadav",
          mobile: "+91 98989 12345",
          whatsapp: "+91 98989 12345",
          email: "kuldeep@delhiexpress.in",
          address: "42, Transport Nagar, Phase-1",
          city: "New Delhi",
          state: "Delhi",
          fleetSize: 18,
          panNumber: "DKPYV8849L",
          gstNumber: "07DKPYV8849L1ZA",
          bankName: "State Bank of India",
          bankAccount: "30491829304",
          ifsc: "SBIN0004019",
          aadhaarNumber: "4529 1048 5928",
          insuranceExpiry: "2027-08-15",
          rcExpiry: "2028-11-22",
          aadhaarUrl: "/mock-docs/aadhaar_verified.jpg",
          panUrl: "/mock-docs/pan_verified.jpg",
          gstUrl: "/mock-docs/gst_verified.jpg",
          chequeUrl: "/mock-docs/cheque_verified.jpg",
          insuranceUrl: "/mock-docs/insurance_verified.jpg",
          rcUrl: "/mock-docs/rc_verified.jpg"
        }
      ];
    }

    // 2. Excel sheet of multi transporter bulk data
    if (lowercaseName.includes('sheet') || lowercaseName.includes('carriers') || lowercaseName.includes('xlsx') || lowercaseName.includes('csv')) {
      return [
        {
          companyName: "Deccan Cargo Lines",
          ownerName: "Karthik Rao",
          mobile: "+91 88990 12345",
          whatsapp: "+91 88990 12345",
          email: "karthik@deccancargo.com",
          address: "G-12, Peenya Industrial Area",
          city: "Bengaluru",
          state: "Karnataka",
          fleetSize: 8,
          panNumber: "ACKPR7732K",
          gstNumber: "29ACKPR7732K1ZN",
          bankName: "HDFC Bank",
          bankAccount: "50200049283049",
          ifsc: "HDFC0000412",
          aadhaarNumber: "7820 4910 3948",
          insuranceExpiry: "2026-10-12",
          rcExpiry: "2027-01-30",
          aadhaarUrl: "/mock-docs/aadhaar_verified.jpg",
          panUrl: "/mock-docs/pan_verified.jpg",
          gstUrl: "/mock-docs/gst_verified.jpg",
          chequeUrl: "/mock-docs/cheque_verified.jpg",
          insuranceUrl: "/mock-docs/insurance_verified.jpg",
          rcUrl: "/mock-docs/rc_verified.jpg"
        },
        {
          companyName: "Gujarat Road Carriers",
          ownerName: "Amit Patel",
          mobile: "+91 98765 43210", // Duplicate mobile (matches a static mock carrier)
          whatsapp: "+91 98765 43210",
          email: "amit@gujaratroad.com",
          address: "Plot A-14, Narol GIDC",
          city: "Ahmedabad",
          state: "Gujarat",
          fleetSize: 22,
          panNumber: "GGGPK9012L",
          gstNumber: "24GGGPK9012L1Z9",
          bankName: "Bank of Baroda",
          bankAccount: "01240212485091",
          ifsc: "BARB0NAROLX",
          aadhaarNumber: "9021 3048 5910",
          insuranceExpiry: "2027-04-05",
          rcExpiry: "2028-09-18",
          aadhaarUrl: "/mock-docs/aadhaar_verified.jpg",
          panUrl: "/mock-docs/pan_verified.jpg",
          gstUrl: "/mock-docs/gst_verified.jpg",
          chequeUrl: "/mock-docs/cheque_verified.jpg",
          insuranceUrl: "/mock-docs/insurance_verified.jpg",
          rcUrl: "/mock-docs/rc_verified.jpg"
        },
        {
          companyName: "Venkateshwara Roadways",
          ownerName: "Raju Prasad",
          mobile: "+91 70130 99887",
          whatsapp: "+91 70130 99887",
          email: "raju@venkateshwara.in",
          address: "Ring Road Janta Chowk",
          city: "Vijayawada",
          state: "Andhra Pradesh",
          fleetSize: 14,
          panNumber: "PANPR8822K",
          gstNumber: "37PANPR8822K9ZZ", // Invalid GST code (should trigger validation error)
          bankName: "Andhra Bank",
          bankAccount: "0491829030",
          ifsc: "ANDB0000491",
          aadhaarNumber: "8820 4910 2200",
          insuranceExpiry: "2023-01-01", // Expired insurance check
          rcExpiry: "2024-02-15", // Expired RC check
          aadhaarUrl: "/mock-docs/aadhaar_expired.jpg",
          panUrl: "/mock-docs/pan_verified.jpg",
          gstUrl: "/mock-docs/gst_invalid.jpg",
          chequeUrl: "/mock-docs/cheque_verified.jpg",
          insuranceUrl: "/mock-docs/insurance_expired.jpg",
          rcUrl: "/mock-docs/rc_expired.jpg"
        },
        {
          companyName: "Fake Enterprise Carriers",
          ownerName: "Manoj Kumar",
          mobile: "+91 90000 11111",
          whatsapp: "+91 90000 11111",
          email: "manoj@fakecarriers.com",
          address: "123, Fraud Street",
          city: "Mumbai",
          state: "Maharashtra",
          fleetSize: 2,
          panNumber: "FAKPK9999F",
          gstNumber: "27FAKPK9999F1Z0",
          bankName: "Yes Bank",
          bankAccount: "0029304918",
          ifsc: "YESB0000102",
          aadhaarNumber: "0000 0000 0000", // Invalid Aadhaar format
          insuranceExpiry: "2026-12-31",
          rcExpiry: "2027-12-31",
          aadhaarUrl: "/mock-docs/aadhaar_fake.jpg", // Fake document indicator
          panUrl: "/mock-docs/pan_fake.jpg",
          gstUrl: "/mock-docs/gst_fake.jpg",
          chequeUrl: "/mock-docs/cheque_fake.jpg",
          insuranceUrl: "/mock-docs/insurance_verified.jpg",
          rcUrl: "/mock-docs/rc_verified.jpg"
        }
      ];
    }

    // 3. Fallback standard extraction
    return [
      {
        companyName: lowercaseName.replace(/\.[^/.]+$/, "").replace(/_/g, " ") + " Transport",
        ownerName: "Subhash Chandra",
        mobile: "+91 99887 76655",
        whatsapp: "+91 99887 76655",
        email: "subhash@chandrarep.com",
        address: "Transport Depot Road, Gate 4",
        city: "Kolkata",
        state: "West Bengal",
        fleetSize: 12,
        panNumber: "SKCPN1049Z",
        gstNumber: "19SKCPN1049Z1ZO",
        bankName: "ICICI Bank",
        bankAccount: "00293048590",
        ifsc: "ICIC0000192",
        aadhaarNumber: "1928 3049 5829",
        insuranceExpiry: "2027-02-18",
        rcExpiry: "2028-04-12",
        aadhaarUrl: "/mock-docs/aadhaar_verified.jpg",
        panUrl: "/mock-docs/pan_verified.jpg",
        gstUrl: "/mock-docs/gst_verified.jpg",
        chequeUrl: "/mock-docs/cheque_verified.jpg",
        insuranceUrl: "/mock-docs/insurance_verified.jpg",
        rcUrl: "/mock-docs/rc_verified.jpg"
      }
    ];
  }
};
