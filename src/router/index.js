import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth';

// Page components
import Login from '../pages/Login.vue';
import Dashboard from '../pages/Dashboard.vue';
import Hardware from '../pages/Hardware.vue';
import Users from '../pages/Users.vue';
import Profile from '../pages/Profile.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: Login },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/hardware',
      name: 'hardware',
      component: Hardware,
      meta: { requiresAuth: true, permission: (store) => store.canAccessHardwareModule }
    },
    {
      path: '/users',
      name: 'users',
      component: Users,
      meta: { requiresAuth: true, permission: (store) => store.canViewUsersPage }
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true }
    },
    { path: '/', redirect: '/dashboard' },
  ]
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  if (authStore.user === null) {
    await authStore.checkSession();
  }

  const requiresAuth = to.meta.requiresAuth;
  const isAuthenticated = authStore.isAuthenticated;
  
  if (requiresAuth && !isAuthenticated) {
    return next({ name: 'login' });
  }

  if (isAuthenticated && to.name === 'login') {
    return next({ name: 'dashboard' });
  }

  if (to.meta.permission) {
    const hasPermission = to.meta.permission(authStore);

    // --- MORE DETAILED DEBUG LOGS ---
    console.log('--- ROUTER GUARD DEBUG (V2) ---');
    console.log('Checking permission for path:', to.path);
    // This trick prints the raw data inside the reactive Proxy object
    console.log('Current user state:', JSON.parse(JSON.stringify(authStore.user)));
    console.log('Permission check result:', hasPermission);
    // ---------------------------------

    if (!hasPermission) {
      console.warn(`Access denied to "${to.path}". User does not have required permission.`);
      return next({ name: 'dashboard' });
    }
  }

  next();
});

export default router