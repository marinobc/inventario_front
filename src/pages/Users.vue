<script setup>
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useInventory } from '@/composables/useInventory'

import PageWrapper from '@/components/common/PageWrapper.vue'
import DataTable from '@/components/common/DataTable.vue'
import ModalForm from '@/components/common/ModalForm.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmDeleteModal from '@/components/common/ConfirmDeleteModal.vue'

const authStore = useAuthStore()
const isEditing = ref(false)

const resourceConfig = {
  endpoint: 'users',
  itemIdKey: 'id',
  itemNameKey: 'username',
  initialFilters: {},
  initialFormState: {
    username: '',
    password: '',
    full_name: '',
    email: '',
    scopeId: null,
    departmentId: null,
  },
  related: {
    departments: '/departments',
    scopes: '/scopes',
  },
  transformIn: (user) => {
    return {
      ...user,
      password: '',
      scopeId: user.scope_id,
      departmentId: user.department_id,
    }
  },
  transformOut: (formData) => {
    const payload = { ...formData }
    if (isEditing.value && !payload.password) delete payload.password
    return payload
  },
}

const {
  items: users,
  isLoading,
  error,
  success,
  relatedData,
  showModal,
  isEditing: isEditingForm,
  currentItem: currentUser,
  itemToDelete: userToDelete,
  handleSave,
  handleConfirmDelete,
  openDeleteModal,
  showCreateForm,
  showEditForm,
  cancelForm,
} = useInventory(resourceConfig)

watch(isEditingForm, (val) => {
  isEditing.value = val
  console.log('Users.vue:watch:isEditingForm', val)
})

function prepareAndShowCreateForm() {
  console.log('Users.vue:prepareAndShowCreateForm');
  let initialData = {};
  if (authStore.user?.scope_name === 'Manager') {
    initialData.departmentId = authStore.user.department_id;
  }
  showCreateForm(initialData); 
}

const tableColumns = ref([
  { key: 'username', label: 'Username' },
  { key: 'full_name', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'department_name', label: 'Department' },
  { key: 'scope_name', label: 'Scope' },
])

const isSelfEditing = computed(() => {
  const val = isEditing.value && authStore.user?.id === currentUser.value.id
  console.log('Users.vue:computed:isSelfEditing', val)
  return val
})
const isDepartmentDisabled = computed(() => {
  const val = authStore.user?.scope_name === 'Manager' || isSelfEditing.value
  console.log('Users.vue:computed:isDepartmentDisabled', val)
  return val
})
const isScopeDisabled = computed(() => {
  const val = isSelfEditing.value
  console.log('Users.vue:computed:isScopeDisabled', val)
  return val
})
const shouldShowPasswordField = computed(() => {
  const val = !isEditing.value || isSelfEditing.value || ['Owner', 'Manager'].includes(authStore.user?.scope_name)
  console.log('Users.vue:computed:shouldShowPasswordField', val)
  return val
})

const availableScopes = computed(() => {
  if (!authStore.user || !relatedData.value.scopes) return []
  let val = []
  if (authStore.user.scope_name === 'Owner') val = relatedData.value.scopes
  else if (authStore.user.scope_name === 'Manager')
    val = relatedData.value.scopes.filter(s => ['Manager', 'Employee'].includes(s.name))
  console.log('Users.vue:computed:availableScopes', val)
  return val
})
</script>

<template>
  <PageWrapper title="User Management">
    <div class="page-controls">
      <BaseButton
        v-if="authStore.permissions.users?.canCreate"
        @click="prepareAndShowCreateForm"
      >
        Add New User
      </BaseButton>
    </div>

    <AlertMessage type="success" :message="success" />
    <AlertMessage type="danger" :message="error" />

    <h2>Existing Users</h2>
    <DataTable
      :items="users"
      :columns="tableColumns"
      :is-loading="isLoading"
      :actions-visible="true"
    >
      <template #actions="{ item }">
        <BaseButton
          v-if="item.canBeEdited"
          variant="secondary"
          @click="() => { console.log('Users.vue:template:showEditForm:item', item); showEditForm(item) }"
        >
          Edit
        </BaseButton>
        <BaseButton
          v-if="item.canBeDeleted"
          variant="danger"
          @click="() => { console.log('Users.vue:template:openDeleteModal:item', item); openDeleteModal(item) }"
        >
          Delete
        </BaseButton>
      </template>
    </DataTable>

    <ModalForm
      :visible="showModal"
      :title="isEditing ? 'Edit User' : 'Add New User'"
      @save="handleSave"
      @close="() => { console.log('Users.vue:template:cancelForm'); cancelForm() }"
    >
      <div class="form-group">
        <label for="username">Username</label>
        <input id="username" v-model="currentUser.username" required />
      </div>
      <div class="form-group">
        <label for="fullName">Full Name</label>
        <input id="fullName" v-model="currentUser.full_name" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="currentUser.email" required />
      </div>
      <div class="form-group" v-if="shouldShowPasswordField">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          v-model="currentUser.password"
          :placeholder="isEditing ? 'Leave blank to keep current' : ''"
          :required="!isEditing"
        />
      </div>
      
      <div class="form-group" v-if="!isSelfEditing">
        <label for="scope">Scope</label>
        <select id="scope" v-model="currentUser.scopeId" :disabled="isScopeDisabled" required>
          <option v-for="scope in availableScopes" :key="scope.id" :value="scope.id">{{ scope.name }}</option>
        </select>
      </div>

      <div class="form-group" v-if="!isSelfEditing">
        <label for="department">Department</label>
        <select id="department" v-model="currentUser.departmentId" :disabled="isDepartmentDisabled" required>
          <option v-for="dept in relatedData.departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
        </select>
      </div>
    </ModalForm>

    <ConfirmDeleteModal
      :visible="!!userToDelete"
      :item-name="userToDelete?.username"
      @close="() => { console.log('Users.vue:template:cancelForm'); cancelForm() }"
      @confirm="handleConfirmDelete"
    />
  </PageWrapper>
</template>