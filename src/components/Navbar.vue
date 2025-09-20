<script setup>
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import BaseButton from '@/components/common/BaseButton.vue';

const authStore = useAuthStore();

const handleLogout = () => {
  console.log('Navbar:handleLogout:user', authStore.user);
  authStore.logout();
};
</script>

<template>
  <nav class="navbar">
    <div class="nav-links">
      <RouterLink to="/dashboard">Dashboard</RouterLink>
      <RouterLink v-if="authStore.permissions.hardware?.canAccessModule" to="/hardware">Hardware</RouterLink>
      <RouterLink v-if="authStore.isAuthenticated" to="/users">Users</RouterLink>
    </div>
    <div class="nav-user">
      <span>Welcome, {{ authStore.user?.username }}!</span>
      <RouterLink to="/profile">Profile</RouterLink>
      <BaseButton variant="secondary" @click="handleLogout">Logout</BaseButton>
    </div>
  </nav>
</template>