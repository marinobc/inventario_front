import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // Proxied by vite.config.js
  withCredentials: true, // IMPORTANT: This line sends the session cookie to the backend
  headers: {
    'Content-Type': 'application/json',
  }
});

export default apiClient;