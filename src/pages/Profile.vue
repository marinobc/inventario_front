<script setup>
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
</script>

<template>
  <div>
    <h1>My Profile</h1>
    <div v-if="authStore.user">
      <p><strong>ID:</strong> {{ authStore.user.id }}</p>
      <p><strong>Username:</strong> {{ authStore.user.username }}</p>
      <p><strong>Scope:</strong> {{ authStore.user.scope_name }}</p>
      </div>
  </div>
</template>