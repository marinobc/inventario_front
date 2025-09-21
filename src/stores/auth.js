import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  // NEW: A ref to hold the permissions object sent from the backend.
  const permissions = ref({}); 
  const isAuthenticated = computed(() => !!user.value);
  const router = useRouter();

  // --- REMOVED ---
  // All computed properties for permissions (canAccessHardwareModule, canCreateUsers, etc.)
  // and all permission-checking functions (canEditUser, canDeleteUser) have been removed.
  // The backend is now the single source of truth for authorization.

  // --- CORE ACTIONS ---
  async function login(credentials) {
    try {
      // The login endpoint now returns user and permissions data.
      const { data } = await apiClient.post('/auth/login', credentials);
      user.value = data.user;
      permissions.value = data.permissions; // Store the permissions object
      router.push('/hardware');
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid username or password.');
    }
  }

  async function logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear all state on logout
      user.value = null;
      permissions.value = {}; 
      router.push('/login');
    }
  }

  async function checkSession() {
    try {
      // The session endpoint also returns user and permissions data.
      const { data } = await apiClient.get('/auth/session');
      if (data.loggedIn) {
        user.value = data.user;
        permissions.value = data.permissions; // Store the permissions object
      } else {
        user.value = null;
        permissions.value = {};
      }
    } catch (error) {
      console.error('Session check failed:', error);
      user.value = null;
      permissions.value = {};
    }
  }

  return {
    user,
    isAuthenticated,
    permissions, // Expose the permissions object to components
    login,
    logout,
    checkSession,
  };
});
