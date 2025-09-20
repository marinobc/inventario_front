import { ref, onMounted, watch } from 'vue'
import { useApiResource } from './useApiResource'
import { useModalForm } from './useModalForm'
import apiClient from '@/services/api'

export function useInventory(config) {
  const { items, isLoading, error, success, fetchAll, save, destroy } = useApiResource(config.endpoint, config.itemNameKey)
  const { showModal, isEditing, currentItem, itemToDelete, openCreateForm, openEditForm, closeForm, openDeleteModal, closeDeleteModal } = useModalForm(config.initialFormState)

  const filters = ref({ ...config.initialFilters })
  const relatedData = ref({})

  const fetchRelatedData = async () => {
    if (!config.related) return
    try {
      const requests = Object.entries(config.related).map(([key, endpoint]) =>
        apiClient.get(endpoint).then(res => [key, res.data])
      )
      const results = await Promise.all(requests)
      relatedData.value = Object.fromEntries(results)
      console.log('useInventory:fetchRelatedData:relatedData', relatedData.value)
    } catch (err) {
      console.log('useInventory:fetchRelatedData:error', err)
      error.value = 'Failed to load necessary form options.'
    }
  }

  const clearFilters = () => {
    filters.value = { ...config.initialFilters }
    console.log('useInventory:clearFilters:filters', filters.value)
  }

  const handleSave = async () => {
    try {
      const payload = config.transformOut ? config.transformOut(currentItem.value) : { ...currentItem.value }
      console.log('useInventory:handleSave:payload', payload)
      await save(payload, payload[config.itemIdKey])
      closeForm()
      await Promise.all([
        fetchAll(filters.value),
        fetchRelatedData()
      ])
    } catch (e) {
      console.log('useInventory:handleSave:error', e)
    }
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete.value) return
    try {
      const itemName = itemToDelete.value[config.itemNameKey] || 'item'
      console.log('useInventory:handleConfirmDelete:item', itemToDelete.value)
      await destroy(itemToDelete.value[config.itemIdKey], itemName)
      closeDeleteModal()
      await Promise.all([
        fetchAll(filters.value),
        fetchRelatedData()
      ])
    } catch (e) {
      console.log('useInventory:handleConfirmDelete:error', e)
    }
  }

  const transformInWithMaps = (item) => {
    const transformedItem = config.transformIn ? config.transformIn(item) : { ...item }

    if (relatedData.value.scopes && item.scope_name) {
      const scope = relatedData.value.scopes.find(s => s.name === item.scope_name)
      if (scope) {
        transformedItem.scopeId = scope.id
        console.log('useInventory:transformInWithMaps:scopeMapped', transformedItem.scopeId)
      }
    }

    if (relatedData.value.departments && item.department_name) {
      const department = relatedData.value.departments.find(d => d.name === item.department_name)
      if (department) {
        transformedItem.departmentId = department.id
        console.log('useInventory:transformInWithMaps:departmentMapped', transformedItem.departmentId)
      }
    }

    return transformedItem
  }

  const showEditForm = (item) => {
    console.log('useInventory:showEditForm:item', item)
    openEditForm(item, transformInWithMaps)
  }

  watch(filters, () => {
    console.log('useInventory:watch:filters', filters.value)
    fetchAll(filters.value)
  }, { deep: true })

  onMounted(() => {
    console.log('useInventory:onMounted:init')
    fetchAll(filters.value)
    fetchRelatedData()
  })

  return {
    items,
    isLoading,
    error,
    success,
    filters,
    relatedData,
    showModal,
    isEditing,
    currentItem,
    itemToDelete,
    handleSave,
    handleConfirmDelete,
    clearFilters,
    showEditForm,
    showCreateForm: openCreateForm,
    openDeleteModal,
    cancelForm: () => {
      closeForm()
      closeDeleteModal()
    }
  }
}