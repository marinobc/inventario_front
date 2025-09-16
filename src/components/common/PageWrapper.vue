<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="page-wrapper">
    <h1>{{ title }}</h1>
    <slot></slot>
  </div>
</template>