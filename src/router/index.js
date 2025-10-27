import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import BpwinViewer from "../pages/BpwinViewer.vue";

import Login from "../pages/Login.vue";
import Hardware from "../pages/Hardware.vue";
import Users from "../pages/Users.vue";
import Profile from "../pages/Profile.vue";
import ScrumViewer from "@/pages/ScrumViewer.vue";
import ScrumViewerFail from "@/pages/ScrumViewerFail.vue";
import BudgetViewer from "@/pages/BudgetViewer.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/login", name: "login", component: Login },
    {
      path: "/hardware",
      name: "hardware",
      component: Hardware,
      meta: {
        requiresAuth: true,
        permission: (store) => store.permissions.hardware?.canAccessModule,
      },
    },
    {
      path: "/users",
      name: "users",
      component: Users,
      meta: { requiresAuth: true },
    },
    {
      path: "/bpwin",
      name: "bpwin",
      component: BpwinViewer,
      meta: { requiresAuth: true },
    },
    {
      path: "/scrum",
      name: "scrum",
      component: ScrumViewer,
      meta: { requiresAuth: true },
    },

    {
      path: "/scrumf",
      name: "scrumf",
      component: ScrumViewerFail,
      meta: { requiresAuth: true },
    },

    {
      path: "/budget",
      name: "budget",
      component: BudgetViewer,
      meta: { requiresAuth: true },
    },

    {
      path: "/profile",
      name: "profile",
      component: Profile,
      meta: { requiresAuth: true },
    },
    { path: "/", redirect: "/hardware" },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (authStore.user === null) {
    await authStore.checkSession();
  }

  const requiresAuth = to.meta.requiresAuth;
  const isAuthenticated = authStore.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
    return next({ name: "login" });
  }

  if (isAuthenticated && to.name === "login") {
    return next({ name: "hardware" });
  }

  if (to.meta.permission) {
    const hasPermission = to.meta.permission(authStore);

    if (!hasPermission) {
      console.warn(
        `Access denied to "${to.path}". User does not have required permission according to backend.`
      );
      return next({ name: "hardware" });
    }
  }

  next();
});

export default router;
