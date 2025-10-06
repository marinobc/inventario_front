<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/services/api';

// Import reusable components
import PageWrapper from '@/components/common/PageWrapper.vue';
import DataTable from '@/components/common/DataTable.vue';
import ModalForm from '@/components/common/ModalForm.vue';
import AlertMessage from '@/components/common/AlertMessage.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import ConfirmDeleteModal from '@/components/common/ConfirmDeleteModal.vue';

const authStore = useAuthStore();

// --- Component State ---
const users = ref([]);
const departments = ref([]);
const scopes = ref([]);
const isLoading = ref(false);
const error = ref('');
const successMessage = ref('');

// --- State for Modals ---
const showFormModal = ref(false);
const isEditing = ref(false);
const currentUser = ref({});
const userToDelete = ref(null); // Used to trigger the delete modal

// --- Computed properties for form UI logic ---
const isSelfEditing = computed(() => isEditing.value && authStore.user?.id === currentUser.value.id);
const isDepartmentDisabled = computed(() => authStore.user?.scope_name === 'Manager' || isSelfEditing.value);
const isScopeDisabled = computed(() => isSelfEditing.value);

const shouldShowPasswordField = computed(() => {
  if (!isEditing.value) return true;
  if (isSelfEditing.value || authStore.user?.scope_name === 'Owner') return true;
  return false;
});

const availableScopes = computed(() => {
  if (!authStore.user) return [];
  if (authStore.user.scope_name === 'Owner') return scopes.value;
  if (authStore.user.scope_name === 'Manager') {
    return scopes.value.filter(s => ['Manager', 'Employee'].includes(s.name));
  }
  return [];
});

// --- Table Columns Definition ---
const tableColumns = ref([
  { key: 'username', label: 'Username' },
  { key: 'full_name', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'department_name', label: 'Department' },
  { key: 'scope_name', label: 'Scope' },
]);

// --- API Functions ---
async function fetchUsers() {
  isLoading.value = true;
  error.value = '';
  try {
    const { data } = await apiClient.get('/users');
    users.value = data;
  } catch (err) {
    error.value = 'Failed to fetch user data.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

async function fetchDepartments() {
  try {
    const { data } = await apiClient.get('/departments');
    departments.value = data;
  } catch (err) {
    console.error('Failed to fetch departments:', err);
  }
}

async function fetchScopes() {
  try {
    const { data } = await apiClient.get('/scopes');
    scopes.value = data;
  } catch (err) {
    console.error('Failed to fetch scopes:', err);
  }
}

async function handleSave() {
  error.value = '';
  successMessage.value = '';
  try {
    if (isEditing.value && currentUser.value.password === '') {
      delete currentUser.value.password;
    }

    if (isEditing.value) {
      const { data } = await apiClient.put(`/users/${currentUser.value.id}`, currentUser.value);
      successMessage.value = `User '${data.username}' updated successfully!`;
    } else {
      const { data } = await apiClient.post('/users', currentUser.value);
      successMessage.value = `User '${data.username}' created successfully!`;
    }
    showFormModal.value = false;
    await fetchUsers();
  } catch (err) {
    error.value = `Failed to save user. ${err.response?.data?.message || ''}`;
    console.error(err);
  }
}

// --- Modal-based Delete Logic ---
function openDeleteModal(user) {
  userToDelete.value = user;
}

async function handleConfirmDelete() {
  if (!userToDelete.value) return;
  try {
    await apiClient.delete(`/users/${userToDelete.value.id}`);
    successMessage.value = `User '${userToDelete.value.username}' deleted successfully.`;
    await fetchUsers();
  } catch (err) {
    error.value = 'Failed to delete user.';
    console.error(err);
  } finally {
    userToDelete.value = null; // Close the modal
  }
}

// --- Form Handling Functions ---
function showCreateForm() {
  isEditing.value = false;
  const defaultDeptId = authStore.user?.scope_name === 'Manager'
    ? authStore.user.department_id
    : (departments.value[0]?.id || 1);

  currentUser.value = {
    username: '',
    password: '',
    full_name: '',
    email: '',
    scopeId: scopes.value.find(s => s.name === 'Employee')?.id || null,
    departmentId: defaultDeptId,
  };
  showFormModal.value = true;
  error.value = '';
  successMessage.value = '';
}

function showEditForm(user) {
  isEditing.value = true;
  const scope = scopes.value.find(s => s.name === user.scope_name);
  const department = departments.value.find(d => d.name === user.department_name);

  currentUser.value = {
    ...user,
    password: '',
    scopeId: scope ? scope.id : null,
    departmentId: department ? department.id : null,
  };
  showFormModal.value = true;
  error.value = '';
  successMessage.value = '';
}

function cancelForm() {
  showFormModal.value = false;
}

// --- Lifecycle Hook ---
onMounted(() => {
  fetchUsers();
  fetchDepartments();
  fetchScopes();
});
</script>

<template>
  <PageWrapper title="User Management">
    <div class="page-controls">
      <BaseButton v-if="authStore.permissions.users?.canCreate" @click="showCreateForm">
        Add New User
      </BaseButton>
    </div>

    <AlertMessage type="success" :message="successMessage" />
    <AlertMessage type="danger" :message="error" />

    <h2>Existing Users</h2>
    <DataTable :items="users" :columns="tableColumns" :is-loading="isLoading" :actions-visible="true">
      <template #actions="{ item }">
        <BaseButton v-if="item.canBeEdited" variant="secondary" @click="showEditForm(item)">Edit</BaseButton>
        <BaseButton v-if="item.canBeDeleted" variant="danger" @click="openDeleteModal(item)">Delete</BaseButton>
      </template>
    </DataTable>

    <ModalForm :visible="showFormModal" :title="isEditing ? 'Edit User' : 'Add New User'" @save="handleSave"
      @close="cancelForm">
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
        <input type="password" id="password" v-model="currentUser.password"
          :placeholder="isEditing ? 'Leave blank to keep current' : ''" :required="!isEditing" />
      </div>
      <div class="form-group">
        <label for="scope">Scope</label>
        <select id="scope" v-model="currentUser.scopeId" :disabled="isScopeDisabled">
          <option v-for="scope in availableScopes" :key="scope.id" :value="scope.id">
            {{ scope.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="department">Department</label>
        <select id="department" v-model="currentUser.departmentId" :disabled="isDepartmentDisabled">
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
      </div>
    </ModalForm>

    <ConfirmDeleteModal :visible="!!userToDelete" :item-name="userToDelete?.username" @close="userToDelete = null"
      @confirm="handleConfirmDelete" />
  </PageWrapper>
</template>