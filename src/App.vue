<script setup>
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Navbar from '@/components/Navbar.vue';
import IdleTimeoutModal from '@/components/IdleTimeoutModal.vue';
import { ref, onUnmounted, watch } from 'vue';
import apiClient from '@/services/api';

const authStore = useAuthStore();

// --- STATE ---
const showIdleModal = ref(false);
const idleCountdown = ref(30);

// --- NEW: HEARTBEAT TIMER ---
let heartbeatInterval = null;

// --- IDLE TIMERS & CONFIG ---
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
  if (!showIdleModal.value) {
    resetIdleTimer();
  }
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
    await apiClient.get('/api/auth/session');
    console.log('Session extended.');
  } catch (error) {
    console.error('Failed to extend session:', error);
  }
}

// --- MODIFIED WATCHER ---
watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    // Stop all timers and intervals when auth state changes
    clearTimeout(idleTimer);
    clearInterval(countdownTimer);
    clearInterval(heartbeatInterval); // <-- Clear heartbeat
    showIdleModal.value = false;

    if (isAuth) {
      // --- SETUP FOR AUTHENTICATED USER ---
      // 1. Activity listeners
      activityEvents.forEach((event) => {
        window.addEventListener(event, handleUserActivity);
      });
      document.addEventListener('visibilitychange', handleVisibilityChange);
      resetIdleTimer();

      // 2. NEW: Start heartbeat ping every 2 minutes
      heartbeatInterval = setInterval(async () => {
        try {
          await apiClient.get('/api/auth/ping');
          console.log(`[${new Date().toLocaleTimeString()}] Session refreshed via heartbeat.`);
        } catch (error) {
          console.error('Heartbeat ping failed:', error);
          clearInterval(heartbeatInterval); // Stop pinging on failure
        }
      }, 2 * 60 * 1000);
    } else {
      // --- CLEANUP FOR LOGGED-OUT USER ---
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  // Final cleanup when the app is closed
  clearInterval(heartbeatInterval);
  activityEvents.forEach((event) => {
    window.removeEventListener(event, handleUserActivity);
  });
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