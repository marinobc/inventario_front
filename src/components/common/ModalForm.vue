<script setup>
import { computed } from 'vue';
import BaseModal from './BaseModal.vue';
import BaseButton from './BaseButton.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['save', 'close']);

const formId = computed(() => {
  const id = `modal-form-${Math.random().toString(36).substring(2, 9)}`;
  console.log('FormModal:formId', id);
  return id;
});

const handleSave = () => {
  console.log('FormModal:handleSave:triggered', true);
  emit('save');
};
</script>

<template>
  <BaseModal :visible="visible" :title="title" @close="emit('close')">
    <form :id="formId" @submit.prevent="handleSave">
      <div class="form-grid">
        <slot></slot>
      </div>
    </form>
    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
      <BaseButton variant="primary" type="submit" :form="formId">Save</BaseButton>
    </template>
  </BaseModal>
</template>