<script setup>
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
</script>

<template>
  <div>
    <h1>Dashboard</h1>
    <p>Welcome, <strong>{{ authStore.user?.username }}</strong>!</p>
    <p>Your role is: <strong>{{ authStore.user?.scope_name }}</strong></p>
    <p>Your department is: <strong>{{ authStore.user?.department_name }}</strong></p>
  </div>
</template>