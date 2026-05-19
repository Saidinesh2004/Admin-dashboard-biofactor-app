import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Settings, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDashboardStore } from '@/store/useStore'
import { useProfileStore } from '@/store/profileStore'
import ProfileAvatar from '../profile/ProfileAvatar'
import ProfileDropdown from '../profile/ProfileDropdown'
import EditProfileModal from '../profile/EditProfileModal'
import LogoutModal from '../profile/LogoutModal'

const Navbar = () => {
  const { toggleSidebar } = useDashboardStore()
  const { profile } = useProfileStore()
  const navigate = useNavigate()

  // Modal & Dropdown visibility states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  // Default fallback details
  const adminName = profile?.fullName || "Admin User"
  const adminRole = profile?.role || "SUPER ADMIN"
  const adminPhoto = profile?.profilePhoto || ""
  const adminEmail = profile?.email || "admin@biofactor.in"
  const isOnline = profile?.isOnline ?? true

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 w-1/3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
          <Menu size={20} />
        </Button>
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search loads, vehicles, transporters..." 
            className="pl-10 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/settings')}
          className="text-gray-500 hover:text-primary transition-colors"
        >
          <Settings size={20} />
        </Button>

        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

        {/* Profile Top Right Corner Section */}
        <div className="relative">
          <Button 
            variant="ghost" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-2 pr-4 py-1 h-auto rounded-full hover:bg-gray-100"
          >
            <ProfileAvatar 
              src={adminPhoto} 
              name={adminName} 
              size="sm" 
              showStatus={true}
              isOnline={isOnline}
            />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold leading-none">{adminName}</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">{adminRole}</p>
            </div>
          </Button>

          {/* Custom Animated Profile Dropdown */}
          <ProfileDropdown 
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            onEditProfile={() => setIsEditModalOpen(true)}
            onLogout={() => setIsLogoutModalOpen(true)}
            adminProfile={{
              fullName: adminName,
              email: adminEmail,
              role: adminRole,
              profilePhoto: adminPhoto,
              isOnline: isOnline
            }}
          />
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Secure Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </header>
  )
}

export default Navbar

