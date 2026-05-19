import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import { Toaster } from '@/components/ui/toaster'
import { useAuthStore } from '@/store/authStore'
import { useProfileStore } from '@/store/profileStore'

const DashboardLayout = () => {
  const { isAuthenticated, initializeAuth } = useAuthStore()
  const { fetchProfile } = useProfileStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Initialize Auth Session
    initializeAuth()
    // Fetch Profile details
    fetchProfile()
  }, [initializeAuth, fetchProfile])

  useEffect(() => {
    // Enforce Route Protection
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-lightBg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  )
}

export default DashboardLayout

