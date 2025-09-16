import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isAuthenticated = computed(() => !!user.value);
  const router = useRouter();

  const userScope = computed(() => user.value?.scope_name || '');
  const userDepartment = computed(() => user.value?.department_name || '');
  
  // Mimic backend scope levels for frontend checks
  const SCOPE_LEVELS = { 'Owner': 3, 'Manager': 2, 'Employee': 1 };

  // --- HARDWARE PERMISSIONS ---
  const canAccessHardwareModule = computed(() => 
    userScope.value === 'Owner' || userDepartment.value === 'Hardware'
  );
  const canCreateUpdateHardware = computed(() => canAccessHardwareModule.value);
  const canDeleteHardware = computed(() => 
    userScope.value === 'Owner' || (userScope.value === 'Manager' && userDepartment.value === 'Hardware')
  );

  // --- USER PERMISSIONS ---
  const canCreateUsers = computed(() => ['Manager', 'Owner'].includes(userScope.value));
  const canViewUsersPage = computed(() => ['Employee', 'Manager', 'Owner'].includes(userScope.value));

  // THIS FUNCTION CONTAINED THE TYPO
  function canEditUser(targetUser) {
    if (!user.value || !targetUser) return false;
    
    // FIX: Corrected variable name from loggedInUse0r to loggedInUser
    const loggedInUser = user.value; 
    const scope = loggedInUser.scope_name;

    if (scope === 'Owner') return true;
    
    // Any user can edit themselves. The form will handle field restrictions.
    if (loggedInUser.id === targetUser.id) return true;
    
    // Manager can edit users in their dept with a scope <= their own.
    if (scope === 'Manager' && loggedInUser.department_id === targetUser.department_id) {
      return SCOPE_LEVELS[scope] >= SCOPE_LEVELS[targetUser.scope_name];
    }
    
    return false;
  }

  function canDeleteUser(targetUser) {
    if (!user.value || !targetUser) return false;
    const loggedInUser = user.value;
    const scope = loggedInUser.scope_name;
    
    if (scope === 'Owner') return true;
    
    // Manager can only delete users in their department with a strictly lower scope.
    if (scope === 'Manager' && loggedInUser.department_id === targetUser.department_id) {
        return SCOPE_LEVELS[scope] > SCOPE_LEVELS[targetUser.scope_name];
    }

    return false;
  }

  // --- CORE ACTIONS ---
  async function login(credentials) {
    try {
      await apiClient.post('/auth/login', credentials);
      await checkSession();
      router.push('/dashboard');
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
      user.value = null;
      router.push('/login');
    }
  }

  async function checkSession() {
    try {
      const { data } = await apiClient.get('/auth/session');
      if (data.loggedIn) {
        user.value = data.user;
      } else {
        user.value = null;
      }
    } catch (error) {
      console.error('Session check failed:', error);
      user.value = null;
    }
  }

  return {
    user,
    isAuthenticated,
    // Hardware Exports
    canAccessHardwareModule,
    canCreateUpdateHardware,
    canDeleteHardware,
    // User Exports
    canCreateUsers,
    canViewUsersPage,
    canEditUser,
    canDeleteUser,
    // Core Action Exports
    login,
    logout,
    checkSession,
  };
});