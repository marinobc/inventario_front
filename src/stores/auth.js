import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const permissions = ref({});
  const isAuthenticated = computed(() => !!user.value);
  const router = useRouter();

  async function login(credentials) {
    try {
      const { data } = await apiClient.post('/auth/login', credentials);
      user.value = data.user;
      permissions.value = data.permissions;
      router.push('/dashboard');
      console.log('AuthStore:login:success', user.value, permissions.value);
    } catch (error) {
      console.error('AuthStore:login:error', error);
      throw new Error('Invalid username or password.');
    }
  }

  async function logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('AuthStore:logout:error', error);
    } finally {
      user.value = null;
      permissions.value = {};
      router.push('/login');
      console.log('AuthStore:logout:stateCleared');
    }
  }

  async function checkSession() {
    try {
      const { data } = await apiClient.get('/auth/session');
      if (data.loggedIn) {
        user.value = data.user;
        permissions.value = data.permissions;
        console.log('AuthStore:checkSession:active', user.value, permissions.value);
      } else {
        user.value = null;
        permissions.value = {};
        console.log('AuthStore:checkSession:none');
      }
    } catch (error) {
      console.error('AuthStore:checkSession:error', error);
      user.value = null;
      permissions.value = {};
    }
  }

  return {
    user,
    isAuthenticated,
    permissions,
    login,
    logout,
    checkSession,
  };
});