<script setup>
import { useAuthStore } from '@/stores/auth';
import PageWrapper from '@/components/common/PageWrapper.vue';

const authStore = useAuthStore();
console.log('DashboardPage:authStore:user', authStore.user);
</script>

<template>
  <PageWrapper title="Dashboard">
    <p>Welcome, <strong>{{ authStore.user?.username }}</strong>!</p>
    <p>Your role is: <strong>{{ authStore.user?.scope_name }}</strong></p>
    <p>Your department is: <strong>{{ authStore.user?.department_name }}</strong></p>
  </PageWrapper>
</template>