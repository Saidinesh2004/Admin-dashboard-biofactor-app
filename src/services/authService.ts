/**
 * Biofactor Logistics ERP
 * Auth Services for Admin Dashboard
 */

export interface UserSession {
  token: string;
  adminId: string;
  role: string;
  loginTime: string;
}

export const authService = {
  /**
   * Securely terminates the admin's ERP session
   * Simulates back-end session destruction & token blacklisting
   */
  logoutAdmin: async (): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      // Simulate real-world network latency (300ms) for clean Framer Motion transitions
      setTimeout(() => {
        // Clear ERP session data from localStorage
        localStorage.removeItem('biofactor_auth_token');
        localStorage.removeItem('biofactor_admin_session');
        localStorage.removeItem('biofactor_admin_profile');
        
        resolve({
          success: true,
          message: 'Admin session terminated successfully. Local storage cleared.'
        });
      }, 300);
    });
  },

  /**
   * Check if there is an active session
   */
  checkSession: (): boolean => {
    const token = localStorage.getItem('biofactor_auth_token');
    return !!token;
  }
};
