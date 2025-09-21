<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, danger
  },
  type: {
    type: String,
    default: 'button',
  },
});

const buttonClass = computed(() => `btn btn-${props.variant}`);
</script>

<template>
  <button :type="type" :class="buttonClass">
    <slot></slot>
  </button>
</template>