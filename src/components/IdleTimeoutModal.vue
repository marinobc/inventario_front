<script setup>
import BaseButton from './common/BaseButton.vue';

const props = defineProps({
  countdown: Number,
});

const emit = defineEmits(['extend-session']);

watch(() => props.countdown, (val) => {
  console.log('SessionTimeoutModal:watch:countdown', val);
});
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>Are you still there?</h2>
      <p>Your session is about to expire due to inactivity.</p>
      <p>You will be logged out in <strong>{{ countdown }}</strong> seconds.</p>
      <BaseButton @click="emit('extend-session')">Yes, Keep Me Logged In</BaseButton>
    </div>
  </div>
</template>