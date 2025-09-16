<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/services/api';

const authStore = useAuthStore();
const SCOPE_LEVELS = { 'Owner': 3, 'Manager': 2, 'Employee': 1 };

// --- Component State ---
const users = ref([]);
const departments = ref([]);
const scopes = ref([]);
const isLoading = ref(false);
const error = ref('');
const successMessage = ref('');

// --- Form State ---
const showForm = ref(false);
const isEditing = ref(false);
const currentUser = ref({});

// --- Computed properties for form logic ---
const isSelfEditing = computed(() => isEditing.value && authStore.user?.id === currentUser.value.id);
const isDepartmentDisabled = computed(() => authStore.user?.scope_name === 'Manager' || isSelfEditing.value);
const isScopeDisabled = computed(() => isSelfEditing.value);

// NEW: This computed property determines when to show the password field in the form.
const shouldShowPasswordField = computed(() => {
  // Always show on create
  if (!isEditing.value) {
    return true;
  }
  // When editing, show if editing self OR if the logged-in user is an Owner
  if (isSelfEditing.value || authStore.user?.scope_name === 'Owner') {
    return true;
  }
  // Hide for a Manager editing an Employee
  return false;
});

const availableScopes = computed(() => {
  if (!authStore.user) return [];
  if (authStore.user.scope_name === 'Owner') {
    return scopes.value;
  }
  if (authStore.user.scope_name === 'Manager') {
    const managerLevel = SCOPE_LEVELS['Manager'];
    return scopes.value.filter(s => SCOPE_LEVELS[s.name] <= managerLevel);
  }
  return [];
});


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
    // If password field is blank during an edit, don't send it
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
    showForm.value = false;
    await fetchUsers(); 
  } catch (err) {
    error.value = `Failed to save user. ${err.response?.data?.message || ''}`;
    console.error(err);
  }
}

async function deleteUser(user) {
  if (confirm(`Are you sure you want to delete user '${user.username}'?`)) {
    try {
      await apiClient.delete(`/users/${user.id}`);
      await fetchUsers();
      successMessage.value = `User '${user.username}' deleted successfully.`;
    } catch (err) {
      error.value = 'Failed to delete user.';
      console.error(err);
    }
  }
}

// --- Form Handlers ---
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
    scopeId: scopes.value[scopes.value.length - 1]?.id || 3,
    departmentId: defaultDeptId,
  };
  showForm.value = true;
  error.value = '';
  successMessage.value = '';
}

function showEditForm(user) {
  isEditing.value = true;
  const scope = scopes.value.find(s => s.name === user.scope_name);
  const department = departments.value.find(d => d.name === user.department_name);
  
  currentUser.value = {
    ...user,
    password: '', // Start with an empty password field for edits
    scopeId: scope ? scope.id : 3,
    departmentId: department ? department.id : 1,
  };
  showForm.value = true;
  error.value = '';
  successMessage.value = '';
}

function cancelForm() {
  showForm.value = false;
}

// --- Lifecycle Hook ---
onMounted(() => {
  fetchUsers();
  fetchDepartments();
  fetchScopes();
});
</script>

<template>
  <div>
    <h1>User Management</h1>
    
    <div class="controls">
      <button v-if="authStore.canCreateUsers" @click="showCreateForm">Add New User</button>
    </div>

    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="showForm" class="form-container">
      <h2>{{ isEditing ? 'Edit User' : 'Add New User' }}</h2>
      <form @submit.prevent="handleSave">
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
            :placeholder="isEditing ? 'Leave blank to keep current password' : ''"
            :required="!isEditing" />
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
        <div class="form-actions">
          <button type="submit">Save User</button>
          <button type="button" @click="cancelForm">Cancel</button>
        </div>
      </form>
    </div>

    <h2>Existing Users</h2>
    <table v-if="!isLoading && users.length > 0">
        <thead>
            <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Scope</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="user in users" :key="user.id">
                <td>{{ user.username }}</td>
                <td>{{ user.full_name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.department_name }}</td>
                <td>{{ user.scope_name }}</td>
                <td>
                    <button v-if="authStore.canEditUser(user)" @click="showEditForm(user)">Edit</button>
                    <button v-if="authStore.canDeleteUser(user)" @click="deleteUser(user)" class="delete-btn">Delete</button>
                </td>
            </tr>
        </tbody>
    </table>
    </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
.controls {
  margin-bottom: 20px;
}
.controls button {
  margin-right: 10px;
}
td button {
  margin-right: 5px;
}
.delete-btn {
    background-color: #e74c3c;
    color: white;
}
.error-message {
    color: #e74c3c;
    background-color: #fdd;
    padding: 10px;
    border-radius: 4px;
    margin: 20px 0;
}
.success-message {
    color: #27ae60;
    background-color: #eafaf1;
    padding: 10px;
    border-radius: 4px;
    margin: 20px 0;
}
.form-container {
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
}
.form-group {
    margin-bottom: 15px;
}
.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}
.form-group input,
.form-group select {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
}
.form-actions {
    margin-top: 20px;
}
.form-actions button {
    margin-right: 10px;
}
</style>