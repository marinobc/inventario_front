import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const defaultUser = {
    username: 'Usuario',
  };

  const defaultPermissions = {
    hardware: {
      canAccessModule: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    users: {
      canViewPage: true,
      canCreate: true,
    }
  };

  const user = ref(defaultUser);
  const permissions = ref(defaultPermissions);
  const isAuthenticated = computed(() => !!user.value);

  async function login() { console.log('Login bypassed'); }
  async function logout() { console.log('Logout bypassed'); }
  async function checkSession() { console.log('Session check bypassed'); }

  return {
    user,
    isAuthenticated,
    permissions,
    login,
    logout,
    checkSession,
  };
});