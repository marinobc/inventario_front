<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const username = ref('');
const password = ref('');
const errorMessage = ref('');

async function handleSubmit() {
  errorMessage.value = '';
  try {
    await authStore.login({ username: username.value, password: password.value });
    // Router will redirect automatically on success
  } catch (error) {
    errorMessage.value = error.message;
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
      <button type="submit">Login</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.login-form {
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  background: white;
  width: 300px;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.error-message {
  color: red;
  margin-top: 15px;
  text-align: center;
}
</style>