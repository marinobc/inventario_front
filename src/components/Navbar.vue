<script setup>
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
};
</script>

<template>
  <nav class="navbar">
    <div class="nav-links">
      <RouterLink to="/dashboard">Dashboard</RouterLink>
      <RouterLink v-if="authStore.canAccessHardwareModule" to="/hardware">Hardware</RouterLink>
      <RouterLink v-if="authStore.canViewUsersPage" to="/users">Users</RouterLink>
    </div>
    <div class="nav-user">
      <span>Welcome, {{ authStore.user?.username }}!</span>
      <RouterLink to="/profile">Profile</RouterLink>
      <button @click="handleLogout">Logout</button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  color: white;
  padding: 10px 20px;
}
.nav-links a, .nav-user a {
  color: white;
  text-decoration: none;
  margin-right: 15px;
}
.nav-links a:hover, .nav-user a:hover {
  text-decoration: underline;
}
.nav-user {
  display: flex;
  align-items: center;
}
.nav-user span {
  margin-right: 15px;
}
.nav-user button {
  background: #555;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
}
.nav-user button:hover {
  background: #777;
}
</style>