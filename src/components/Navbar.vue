<script setup>
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import BaseButton from '@/components/common/BaseButton.vue';

const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  window.location.href = 'https://sis-322-hagen-co.vercel.app/';
};
</script>

<template>
  <nav class="navbar">
    <div class="nav-links">
      <!--<RouterLink to="/dashboard">Dashboard</RouterLink>-->
      <RouterLink v-if="authStore.permissions.hardware?.canAccessModule" to="/hardware">HARDWARE</RouterLink>
      <!--<RouterLink v-if="authStore.isAuthenticated" to="/users">Users</RouterLink>-->
    </div>
    <div class="nav-user">
      <span>WELCOME, {{ authStore.user?.username }}!</span>
      <!--<RouterLink to="/profile">Profile</RouterLink>-->
      <BaseButton class="btnlogout" @click="handleLogout">Logout</BaseButton>
    </div>
  </nav>
</template>
