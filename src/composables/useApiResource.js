// ARCHIVO: src/composables/useApiResource.js
import { ref } from 'vue';
import apiClient from '@/services/api';

export function useApiResource(endpoint, itemNameKey) {
  const items = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const success = ref('');

  const fetchAll = async (params = {}) => {
    isLoading.value = true;
    error.value = null;
    success.value = '';
    console.log(`useApiResource:fetchAll:endpoint:${endpoint}`, params);
    try {
      const { data } = await apiClient.get(`/${endpoint}`, { params });
      items.value = data;
      console.log(`useApiResource:fetchAll:items`, items.value);
    } catch (e) {
      error.value = `Failed to fetch ${endpoint}.`;
      console.error('useApiResource:fetchAll:error', e);
    } finally {
      isLoading.value = false;
    }
  };

  const save = async (item, id = null) => {
    isLoading.value = true;
    error.value = null;
    success.value = '';
    console.log(`useApiResource:save:id:${id}`, item);
    try {
      if (id) {
        await apiClient.put(`/${endpoint}/${id}`, item);
      } else {
        await apiClient.post(`/${endpoint}`, item);
      }
      success.value = `Item saved successfully!`;
      console.log('useApiResource:save:success', success.value);
    } catch (e) {
      error.value = `Failed to save item. ${e.response?.data?.message || ''}`;
      console.error('useApiResource:save:error', e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  const destroy = async (id, itemName = 'item') => {
    isLoading.value = true;
    error.value = null;
    success.value = '';
    console.log(`useApiResource:destroy:id:${id}:itemName:${itemName}`);
    try {
      await apiClient.delete(`/${endpoint}/${id}`);
      success.value = `Successfully deleted '${itemName}'.`;
      console.log('useApiResource:destroy:success', success.value);
    } catch (e) {
      error.value = 'Failed to delete item.';
      console.error('useApiResource:destroy:error', e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  return { items, isLoading, error, success, fetchAll, save, destroy };
}