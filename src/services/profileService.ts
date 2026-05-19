/**
 * Biofactor Logistics ERP
 * Profile Services for Admin Dashboard
 */

export interface AdminProfile {
  fullName: string;
  email: string;
  mobileNumber: string;
  profilePhoto: string; // Base64 or Unsplash URL
  role: string;
  isOnline: boolean;
}

const DEFAULT_PROFILE: AdminProfile = {
  fullName: "Dinesh Kumar",
  email: "dinesh.kumar@biofactor.in",
  mobileNumber: "+91 98765 43210",
  profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
  role: "SUPER ADMIN",
  isOnline: true
};

export const profileService = {
  /**
   * Fetches the current admin profile from local storage or returns the default profile
   */
  fetchAdminProfile: async (): Promise<AdminProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedProfile = localStorage.getItem('biofactor_admin_profile');
        if (storedProfile) {
          try {
            resolve(JSON.parse(storedProfile));
            return;
          } catch (e) {
            console.error("Error parsing stored admin profile, using default.", e);
          }
        }
        // If not found in local storage, save and return default
        localStorage.setItem('biofactor_admin_profile', JSON.stringify(DEFAULT_PROFILE));
        resolve(DEFAULT_PROFILE);
      }, 250);
    });
  },

  /**
   * Validates and updates the admin profile
   */
  updateAdminProfile: async (profileData: Partial<AdminProfile>): Promise<AdminProfile> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validation
        if (profileData.fullName && profileData.fullName.trim().length < 3) {
          reject(new Error("Full Name must be at least 3 characters long."));
          return;
        }

        if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
          reject(new Error("Please enter a valid email address."));
          return;
        }

        if (profileData.mobileNumber && !/^\+?[0-9\s-]{10,15}$/.test(profileData.mobileNumber.replace(/\s+/g, ''))) {
          reject(new Error("Please enter a valid mobile number (10-15 digits)."));
          return;
        }

        const storedProfile = localStorage.getItem('biofactor_admin_profile');
        let currentProfile: AdminProfile = DEFAULT_PROFILE;
        if (storedProfile) {
          try {
            currentProfile = JSON.parse(storedProfile);
          } catch (e) {
            console.error(e);
          }
        }

        const updatedProfile = {
          ...currentProfile,
          ...profileData
        };

        localStorage.setItem('biofactor_admin_profile', JSON.stringify(updatedProfile));
        resolve(updatedProfile);
      }, 400);
    });
  },

  /**
   * Simulates uploading a profile photo and converts it to a Base64 string for persistent client-side storage
   */
  uploadProfilePhoto: async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        reject(new Error("Invalid file type. Supported formats: PNG, JPG, JPEG."));
        return;
      }

      // Validate file size (max 2MB for local storage Base64 strings)
      if (file.size > 2 * 1024 * 1024) {
        reject(new Error("File too large. Maximum size is 2MB."));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read image file."));
        }
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file."));
      };
      reader.readAsDataURL(file);
    });
  }
};
