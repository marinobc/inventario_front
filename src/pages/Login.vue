<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import BaseButton from '@/components/common/BaseButton.vue';

const authStore = useAuthStore();
const username = ref('');
const password = ref('');
const errorMessage = ref('');

async function handleSubmit() {
  errorMessage.value = '';
  console.log('LoginForm:handleSubmit:username', username.value);
  try {
    await authStore.login({ username: username.value, password: password.value });
    console.log('LoginForm:handleSubmit:success');
  } catch (error) {
    errorMessage.value = error.message;
    console.error('LoginForm:handleSubmit:error', error);
  }
}
</script>

<template>
  <div class="login-container">
    <form @submit.prevent="handleSubmit" class="login-form">
      <h2>Inventory Login</h2>
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" v-model="username" required>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <BaseButton type="submit">Login</BaseButton>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </div>
</template>