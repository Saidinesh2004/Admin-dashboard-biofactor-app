import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import ManageLoads from './pages/loads/ManageLoads'
import Transporters from './pages/transporters/Transporters'
import Trips from './pages/trips/Trips'
import PODVerification from './pages/pod/PODVerification'
import Reports from './pages/reports/Reports'
import Payments from './pages/payments/Payments'
import CreateLoadPage from './pages/loads/CreateLoadPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="loads" element={<ManageLoads />} />
          <Route path="create-load" element={<CreateLoadPage />} />
          <Route path="bids" element={<ManageLoads />} />
          <Route path="bids/analytics" element={<Reports />} />
          <Route path="trips" element={<Trips />} />
          <Route path="trips/track" element={<Trips />} />
          <Route path="pod" element={<PODVerification />} />
          <Route path="users" element={<Transporters />} />
          <Route path="roles" element={<Transporters />} />
          <Route path="vehicles" element={<Trips />} />
          <Route path="payments" element={<Payments />} />
          <Route path="invoices" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<div>Settings Module</div>} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
