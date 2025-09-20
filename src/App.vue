<script setup>
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Navbar from '@/components/Navbar.vue';
import IdleTimeoutModal from '@/components/IdleTimeoutModal.vue';
import { ref, onUnmounted, watch } from 'vue';
import apiClient from '@/services/api';

const authStore = useAuthStore();

const showIdleModal = ref(false);
const idleCountdown = ref(30);
let heartbeatInterval = null;
let idleTimer = null;
let countdownTimer = null;
let hiddenTimestamp = null;

const TOTAL_SESSION_DURATION = 3 * 60 * 1000;
const IDLE_TIMEOUT = 2.5 * 60 * 1000;
const MODAL_COUNTDOWN_SECONDS = 30;
const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

function handleVisibilityChange() {
  if (!authStore.isAuthenticated) return;
  if (document.hidden) {
    clearTimeout(idleTimer);
    hiddenTimestamp = Date.now();
  } else {
    if (hiddenTimestamp) {
      const elapsed = Date.now() - hiddenTimestamp;
      if (elapsed >= TOTAL_SESSION_DURATION) {
        authStore.logout();
      } else {
        handleUserActivity();
      }
    }
    hiddenTimestamp = null;
  }
}

function handleUserActivity() {
  if (!showIdleModal.value) resetIdleTimer();
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  clearInterval(countdownTimer);
  idleTimer = setTimeout(() => {
    idleCountdown.value = MODAL_COUNTDOWN_SECONDS;
    showIdleModal.value = true;
    startCountdown();
  }, IDLE_TIMEOUT);
}

function startCountdown() {
  countdownTimer = setInterval(() => {
    idleCountdown.value--;
    if (idleCountdown.value <= 0) {
      clearInterval(countdownTimer);
      authStore.logout();
    }
  }, 1000);
}

async function extendSession() {
  showIdleModal.value = false;
  resetIdleTimer();
  try {
    await apiClient.get('/auth/session');
    console.log('AppLayout:extendSession:success');
  } catch (error) {
    console.error('AppLayout:extendSession:error', error);
  }
}

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    clearTimeout(idleTimer);
    clearInterval(countdownTimer);
    clearInterval(heartbeatInterval);
    showIdleModal.value = false;

    if (isAuth) {
      activityEvents.forEach(event => window.addEventListener(event, handleUserActivity));
      document.addEventListener('visibilitychange', handleVisibilityChange);
      resetIdleTimer();

      heartbeatInterval = setInterval(async () => {
        try {
          await apiClient.get('/auth/ping');
          console.log(`[${new Date().toLocaleTimeString()}] AppLayout:heartbeat:success`);
        } catch (error) {
          console.error('AppLayout:heartbeat:error', error);
          clearInterval(heartbeatInterval);
        }
      }, 2 * 60 * 1000);
    } else {
      activityEvents.forEach(event => window.removeEventListener(event, handleUserActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  clearInterval(heartbeatInterval);
  activityEvents.forEach(event => window.removeEventListener(event, handleUserActivity));
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<template>
  <header>
    <Navbar v-if="authStore.isAuthenticated" />
  </header>

  <main class="main-content">
    <RouterView />
  </main>

  <IdleTimeoutModal
    v-if="showIdleModal"
    :countdown="idleCountdown"
    @extend-session="extendSession"
  />
</template>