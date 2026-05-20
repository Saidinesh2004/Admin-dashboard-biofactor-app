/**
 * Robust API Client for Biofactor Admin Dashboard
 * Connects to the developer's live ngrok backend.
 * Handles automatic failover to local storage and mock data if the ngrok URL is offline.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://anabella-furuncular-tammi.ngrok-free.dev';

// Custom headers to bypass ngrok landing/warning page & support JSON payloads
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };
};

export interface APIConnectionStatus {
  isConnected: boolean;
  mode: 'live' | 'demo';
  url: string;
  errorMessage?: string;
}

export const apiClient = {
  /**
   * Pings the backend to verify if it is online and reachable.
   */
  checkConnection: async (): Promise<APIConnectionStatus> => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for fast UI response

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: getHeaders(),
        signal: controller.signal,
      }).catch(async () => {
        // Fallback check: try fetching loads endpoint directly in case /health is not defined
        return fetch(`${API_BASE_URL}/api/loads`, {
          method: 'GET',
          headers: getHeaders(),
          signal: controller.signal,
        });
      });

      clearTimeout(id);

      if (response.ok) {
        return { isConnected: true, mode: 'live', url: API_BASE_URL };
      } else {
        return { 
          isConnected: false, 
          mode: 'demo', 
          url: API_BASE_URL, 
          errorMessage: `Server returned status: ${response.status}` 
        };
      }
    } catch (error: any) {
      return { 
        isConnected: false, 
        mode: 'demo', 
        url: API_BASE_URL, 
        errorMessage: error.message || 'Network unreachable' 
      };
    }
  },

  /**
   * Fetches loads from the backend. Fallback handled inside store.
   */
  getLoads: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/api/loads`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch loads: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Creates a new load on the backend.
   */
  createLoad: async (loadData: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/loads`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(loadData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create load: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Updates an existing load on the backend.
   */
  updateLoad: async (id: string, updatedFields: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/loads/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updatedFields),
    });
    if (!response.ok) {
      throw new Error(`Failed to update load: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Deletes a load on the backend.
   */
  deleteLoad: async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/api/loads/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete load: ${response.statusText}`);
    }
    return true;
  },

  /**
   * Approves a specific transporter bid on the backend.
   */
  approveBid: async (loadId: string, bidId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/loads/${loadId}/bids/${bidId}/approve`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to approve bid: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Submits a negotiation counter-offer on the backend.
   */
  negotiateBid: async (loadId: string, bidId: string, negotiationDetails: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/loads/${loadId}/bids/${bidId}/negotiate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(negotiationDetails),
    });
    if (!response.ok) {
      throw new Error(`Failed to negotiate bid: ${response.statusText}`);
    }
    return response.json();
  }
};
