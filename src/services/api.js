import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const apiClient = axios.create({
  // Use environment variable
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      console.warn('Session expired or invalid. Logging out.');
      const authStore = useAuthStore();
      authStore.logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;