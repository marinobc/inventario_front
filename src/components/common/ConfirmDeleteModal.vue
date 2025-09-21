<script setup>
import BaseModal from './BaseModal.vue';
import BaseButton from './BaseButton.vue';

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  itemName: {
    type: String,
    default: 'this item',
  },
});

const emit = defineEmits(['close', 'confirm']);
</script>

<template>
  <BaseModal :visible="visible" title="Confirm Deletion" @close="emit('close')">
    <p>
      Are you sure you want to delete <strong>{{ itemName }}</strong
      >?
    </p>
    <p>This action cannot be undone.</p>
    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
      <BaseButton variant="danger" @click="emit('confirm')">Delete</BaseButton>
    </template>
  </BaseModal>
</template>