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
      meta: { requiresAuth: true, permission: (store) => store.permissions.hardware?.canAccessModule }
    },
    {
      path: '/users',
      name: 'users',
      component: Users,
      // UPDATED: The specific permission check is removed.
      // Any authenticated user can now access this route.
      meta: { requiresAuth: true }
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

// The router.beforeEach guard does not need any changes.
// It will correctly handle the updated meta property for the /users route.
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

    if (!hasPermission) {
      console.warn(`Access denied to "${to.path}". User does not have required permission according to backend.`);
      return next({ name: 'dashboard' });
    }
  }

  next();
});

export default router