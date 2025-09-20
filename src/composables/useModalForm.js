// ARCHIVO: src/composables/useModalForm.js
import { ref } from 'vue';

export function useModalForm(initialState = {}) {
  const showModal = ref(false);
  const isEditing = ref(false);
  const currentItem = ref({ ...initialState });
  const itemToDelete = ref(null);

  const openCreateForm = (data = {}) => {
    isEditing.value = false;
    currentItem.value = { ...initialState, ...data }; 
    showModal.value = true;
    console.log('useModalForm:openCreateForm:currentItem con data', currentItem.value);
  };

  const openEditForm = (item, transformIn) => {
    isEditing.value = true;
    currentItem.value = transformIn ? transformIn(item) : { ...item };
    showModal.value = true;
    console.log('useModalForm:openEditForm:currentItem', currentItem.value);
  };

  const closeForm = () => {
    showModal.value = false;
    console.log('useModalForm:closeForm');
  };

  const openDeleteModal = (item) => {
    itemToDelete.value = item;
    console.log('useModalForm:openDeleteModal:itemToDelete', itemToDelete.value);
  };
  
  const closeDeleteModal = () => {
    itemToDelete.value = null;
    console.log('useModalForm:closeDeleteModal');
  };

  return { showModal, isEditing, currentItem, itemToDelete, openCreateForm, openEditForm, closeForm, openDeleteModal, closeDeleteModal };
}