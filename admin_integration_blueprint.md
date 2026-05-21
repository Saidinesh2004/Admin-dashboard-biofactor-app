# Admin Web Application Integration Blueprint

This technical document outlines the exact user interface (UI) requirements, database state transitions, and API endpoints needed to synchronize the Admin Web Application with the Driver and Transporter mobile bidding system.

## 🖥️ 1. "Manage Load" Bidding Table UI
When the Admin views quotes submitted for an open cargo load, they must see a sorted data table showing all active bids.

### Table Columns Layout:
| Column Name | Data Field / Source | Description / Logic |
| :--- | :--- | :--- |
| **Rank** | Sort index (1, 2, 3...) | Calculated: Sorted in ascending order by Bid Amount (lowest price ranks #1). |
| **Name** | `bid.user.name` or `bid.transporterName` | Display the full name of the Driver or Transporter. |
| **Role** | `bid.user_type` or `bid.role` | Display whether the bidder is a "Driver" or "Transporter". |
| **Bid Amount** | `bid.bid_amount` or `bid.pricePerTonne` | The quote submitted per tonne (e.g., ₹1,820 / T). |
| **Total Amount** | `bid.bid_amount * load.number_of_tonnes` | Calculated: Automatically multiply the user's rate by the cargo's total tonnage. |
| **Rating** | `bid.user.rating` or `bid.driverRating` | Display rating (e.g., 4.8 ★ or star indicators). |
| **Status** | `bid.status` | Display badge color: Amber for PENDING, Green for ACCEPTED, Red for REJECTED. |
| **Action** | Action button | Render an "Approve Bid" button. |

---

## 🔄 2. The Acceptance & Bidding Lifecycle
Here is the exact state machine the web developer must call when approving a bid:

### Step A: Accept the Winning Quote
When the Admin clicks the Approve button, the web app must trigger:
- **API Call**: `POST /api/bids/accept/{quote_id}`
- **Backend Database Transitions**:
  - The winning bid's status changes from "PENDING" ➔ "ACCEPTED".
  - All other bids on this load are automatically updated to "REJECTED".
  - The load's status is changed from "OPEN" ➔ "CLOSED".
  - A new Trip is automatically created in the database with status "PENDING".

```
Admin clicks Approve Quote
       │
       ▼
POST /api/bids/accept/{quote_id}
       │
       ├─➔ Winner status: ACCEPTED
       ├─➔ Other bids: REJECTED
       ├─➔ Load status: CLOSED
       └─➔ Trip created: PENDING
```

---

## 📄 3. KYC Document Verification Workflow
After the driver or transporter receives the ACCEPTED alert in their app, they provide vehicle details and submit their files.
- **Pre-population**: If the files exist in the user's profile database (from registration), the mobile app instantly attaches them.
- **Web Display**: The web developer must render a "Review Vehicle Documents" module under the active bid:
  - **Required Documents**:
    - Vehicle RC (Registration Certificate)
    - Insurance Policy
  - **Action**: Provide a click-to-preview modal showing the high-resolution image uploads.

---

## 📍 4. Location & Address Dispatch
Once the Admin reviews and approves the RC and Insurance documents, they must assign loading/unloading addresses.
- **Action**: Provide an "Assign Location Details" form inside the trip dashboard.
- **API Endpoint**: `POST /api/trips/{trip_id}/dispatch`
- **Request Payload (JSON)**:
```json
{
  "loading_address": "Plant Gate #3, Biofactor Industrial Zone, Hyderabad, TS",
  "unloading_address": "Warehouse B-12, Agriculture Center, Vijayawada, AP",
  "loading_gps_coordinates": "17.385044, 78.486671",
  "unloading_gps_coordinates": "16.506174, 80.648015"
}
```
- **Mobile Synchronization**: Submitting this payload immediately pushes the addresses to the driver/transporter's Trips Section card in the mobile app.

---

## 🗺️ 5. Live Tracking Interface
Once the trip is active, the driver/transporter's GPS signals are streamed to the backend.
- The web developer must render a "Live Tracking Panel" using Google Maps or OpenStreetMap APIs, pulling active coordinate histories from the database to plot their live route.
