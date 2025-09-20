<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});

console.log('PageWrapper:props:title', props.title);
</script>

<template>
  <div class="page-wrapper">
    <h1>{{ title }}</h1>
    <slot></slot>
  </div>
</template>