<script setup>
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import Navbar from '@/components/Navbar.vue';

const authStore = useAuthStore();
</script>

<template>
  <header>
    <Navbar v-if="authStore.isAuthenticated" />
  </header>

  <main class="main-content">
    <RouterView />
  </main>
</template>

<style>
/* Basic styling for layout */
body {
  font-family: sans-serif;
  margin: 0;
  background-color: #f4f4f9;
}
.main-content {
  padding: 20px;
}
</style>