import { create } from 'zustand';
import { authService } from '@/services/authService';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true, // Default to true for instant demo access
  isLoading: false,
  token: null,

  login: (token: string) => {
    localStorage.setItem('biofactor_auth_token', token);
    set({ isAuthenticated: true, token });
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logoutAdmin();
      set({ isAuthenticated: false, token: null });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  initializeAuth: () => {
    const token = localStorage.getItem('biofactor_auth_token');
    if (token) {
      set({ isAuthenticated: true, token });
    } else {
      // For demo purposes, auto-login with a mock token if none exists,
      // so the user doesn't hit a blank screen initially.
      const mockToken = 'mock_jwt_token_biofactor_superadmin';
      localStorage.setItem('biofactor_auth_token', mockToken);
      set({ isAuthenticated: true, token: mockToken });
    }
  }
}));
