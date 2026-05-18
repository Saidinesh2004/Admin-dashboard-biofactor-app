import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import ManageLoads from './pages/loads/ManageLoads'
import Transporters from './pages/transporters/Transporters'
import BulkRegistrationPage from './pages/BulkRegistrationPage'

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
          
          <Route path="payments" element={<Payments />} />
          
          <Route path="users" element={<Transporters />} />
          <Route path="bulk-registrations" element={<BulkRegistrationPage />} />
          
          <Route path="reports" element={<Reports />} />
          
          <Route path="settings" element={<div>General Settings</div>} />
          <Route path="settings/documents" element={<div>Documents</div>} />
          <Route path="settings/notifications" element={<div>Notifications</div>} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
