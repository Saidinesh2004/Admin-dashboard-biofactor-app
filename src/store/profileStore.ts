import { create } from 'zustand';
import { profileService, AdminProfile } from '@/services/profileService';

interface ProfileState {
  profile: AdminProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<AdminProfile>) => Promise<boolean>;
  uploadPhoto: (file: File) => Promise<string | null>;
  removePhoto: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await profileService.fetchAdminProfile();
      set({ profile: data });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch admin profile' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data: Partial<AdminProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await profileService.updateAdminProfile(data);
      set({ profile: updated });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update admin profile' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  uploadPhoto: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const photoUrl = await profileService.uploadProfilePhoto(file);
      const currentProfile = get().profile;
      if (currentProfile) {
        await get().updateProfile({ profilePhoto: photoUrl });
      }
      return photoUrl;
    } catch (err: any) {
      set({ error: err.message || 'Failed to upload photo' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  removePhoto: async () => {
    const currentProfile = get().profile;
    if (currentProfile) {
      // Revert to initials placeholder
      await get().updateProfile({ 
        profilePhoto: "" 
      });
    }
  }
}));
