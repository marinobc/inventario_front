<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  type: {
    type: String,
    default: 'button',
  },
});

const buttonClass = computed(() => {
  console.log('ButtonComponent:buttonClass:variant', props.variant);
  return `btn btn-${props.variant}`;
});
</script>

<template>
  <button :type="type" :class="buttonClass">
    <slot></slot>
  </button>
</template>
