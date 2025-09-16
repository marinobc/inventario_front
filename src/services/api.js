import axios from 'axios';
import { useAuthStore } from '@/stores/auth'; // Import Pinia store

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- ADD THIS INTERCEPTOR ---
apiClient.interceptors.response.use(
  // If the response is successful, just pass it through
  (response) => response,

  // If there's an error, check if it's a 401
  (error) => {
    // Check if the error is a 401 and we're not already on the login page
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      console.warn('Session expired or invalid. Logging out.');
      const authStore = useAuthStore();
      // Use the store's logout action, which handles state clearing and redirection
      authStore.logout();
    }
    // IMPORTANT: Reject the promise to allow individual .catch() blocks to run
    return Promise.reject(error);
  }
);
// --- END OF INTERCEPTOR ---

export default apiClient;