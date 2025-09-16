<script setup>
import { useAuthStore } from '@/stores/auth';
import PageWrapper from '@/components/common/PageWrapper.vue';
const authStore = useAuthStore();
</script>

<template>
  <PageWrapper title="My Profile">
    <div v-if="authStore.user">
      <p><strong>ID:</strong> {{ authStore.user.id }}</p>
      <p><strong>Username:</strong> {{ authStore.user.username }}</p>
      <p><strong>Scope:</strong> {{ authStore.user.scope_name }}</p>
    </div>
    <div v-else>
      <p>Loading profile...</p>
    </div>
  </PageWrapper>
</template>