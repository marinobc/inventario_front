<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
});

const alertClass = computed(() => `alert alert-${props.type}`);
</script>

<template>
  <div v-if="message" :class="alertClass">
    {{ message }}
  </div>
</template>