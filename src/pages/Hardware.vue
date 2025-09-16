<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/services/api';

const authStore = useAuthStore();

// --- Component State ---
const hardwareItems = ref([]);
const isLoading = ref(true);
const error = ref('');

// --- Filter State ---
const initialFilters = {
  tipo_equipo_id_tipo: '',
  marca: '',
  fecha_mantenimiento: '',
  version_so: '',
  responsable: '',
  estado: '',
};
const filters = ref({ ...initialFilters });
const filterOptions = ref({
  tipos: [],
  marcas: [],
  versiones_so: [],
  responsables: [],
  estados: [],
});

// --- Form State ---
const showForm = ref(false);
const isEditing = ref(false);
const currentItem = ref({});

// --- Computed property for the page subtitle ---
const pageSubtitle = computed(() => {
  if (authStore.user?.scope_name === 'Owner') {
    return "Viewing Hardware Department Inventory (Full Access)";
  }
  if (authStore.user?.department_name === 'Hardware') {
    return `Viewing Inventory for the ${authStore.user.department_name} Department`;
  }
  return '';
});

// --- API Functions ---
async function fetchHardware() {
  isLoading.value = true;
  error.value = '';
  try {
    const { data } = await apiClient.get('/hardware', { params: filters.value });
    hardwareItems.value = data;
  } catch (err) {
    error.value = 'Failed to fetch hardware data. You may not have permission to view this department.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

async function fetchFilterOptions() {
  try {
    const { data } = await apiClient.get('/hardware/filters');
    filterOptions.value = data;
  } catch (err) {
    console.error('Failed to load filter options:', err);
  }
}

// Automatically re-fetch data whenever a filter value changes
watch(filters, fetchHardware, { deep: true });

function clearFilters() {
  filters.value = { ...initialFilters };
}

async function handleSave() {
  if (!currentItem.value) return;
  try {
    if (isEditing.value) {
      await apiClient.put(`/hardware/${currentItem.value.id_hardware}`, currentItem.value);
    } else {
      await apiClient.post('/hardware', currentItem.value);
    }
    showForm.value = false;
    await fetchHardware();
  } catch (err) {
    error.value = `Failed to save hardware. ${err.response?.data?.message || ''}`;
    console.error(err);
  }
}

async function deleteItem(item) {
  if (confirm(`Are you sure you want to delete ${item.marca} ${item.modelo}?`)) {
    try {
      await apiClient.delete(`/hardware/${item.id_hardware}`);
      await fetchHardware();
    } catch (err) {
      error.value = 'Failed to delete hardware item.';
      console.error(err);
    }
  }
}

// --- Form Handling Functions ---
function showCreateForm() {
  isEditing.value = false;
  currentItem.value = {
    marca: '',
    modelo: '',
    serie: '',
    fecha_mantenimiento: new Date().toISOString().split('T')[0],
    version_so: '',
    responsable: '',
    costo: 0.00,
    estado: 'Activo',
    tipo_equipo_id_tipo: 1
  };
  showForm.value = true;
  error.value = '';
}

function showEditForm(item) {
  isEditing.value = true;
  const editableItem = { ...item };
  if (editableItem.fecha_mantenimiento) {
    editableItem.fecha_mantenimiento = new Date(item.fecha_mantenimiento).toISOString().split('T')[0];
  }
  currentItem.value = editableItem;
  showForm.value = true;
  error.value = '';
}

function cancelForm() {
  showForm.value = false;
}

// --- Lifecycle Hook ---
onMounted(() => {
  fetchHardware();
  fetchFilterOptions();
});
</script>

<template>
  <div>
    <h1>Hardware Inventory</h1>
    <p class="subtitle"><em>{{ pageSubtitle }}</em></p>

    <div class="filter-container">
      <div class="filter-grid">
        <div class="filter-group">
          <label for="filter-tipo">Type</label>
          <select id="filter-tipo" v-model="filters.tipo_equipo_id_tipo">
            <option value="">All</option>
            <option v-for="tipo in filterOptions.tipos" :key="tipo.id_tipo" :value="tipo.id_tipo">
              {{ tipo.tipo }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-marca">Brand</label>
          <select id="filter-marca" v-model="filters.marca">
            <option value="">All</option>
            <option v-for="marca in filterOptions.marcas" :key="marca" :value="marca">{{ marca }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-estado">State</label>
          <select id="filter-estado" v-model="filters.estado">
            <option value="">All</option>
            <option v-for="estado in filterOptions.estados" :key="estado" :value="estado">{{ estado }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-responsable">Responsible</label>
          <select id="filter-responsable" v-model="filters.responsable">
            <option value="">All</option>
            <option v-for="resp in filterOptions.responsables" :key="resp" :value="resp">{{ resp }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-version_so">OS Version</label>
          <select id="filter-version_so" v-model="filters.version_so">
            <option value="">All</option>
            <option v-for="ver in filterOptions.versiones_so" :key="ver" :value="ver">{{ ver }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-fecha">Maintenance Date</label>
          <input type="date" id="filter-fecha" v-model="filters.fecha_mantenimiento" />
        </div>
      </div>
      <button @click="clearFilters" class="clear-btn">Clear Filters</button>
    </div>

    <div class="controls">
      <button v-if="authStore.canCreateUpdateHardware" @click="showCreateForm">Add New Hardware</button>
    </div>

    <div v-if="showForm" class="form-container">
      <h2>{{ isEditing ? 'Edit Hardware' : 'Add New Hardware' }}</h2>
      <form @submit.prevent="handleSave">
        <div class="form-grid">
          <div class="form-group">
            <label for="marca">Brand</label>
            <input id="marca" v-model="currentItem.marca" required />
          </div>
          <div class="form-group">
            <label for="modelo">Model</label>
            <input id="modelo" v-model="currentItem.modelo" required />
          </div>
          <div class="form-group">
            <label for="serie">Serial Number</label>
            <input id="serie" v-model="currentItem.serie" required />
          </div>
          <div class="form-group">
            <label for="responsable">Person Responsible</label>
            <input id="responsable" v-model="currentItem.responsable" required />
          </div>
          <div class="form-group">
            <label for="version_so">OS Version</label>
            <input id="version_so" v-model="currentItem.version_so" required />
          </div>
          <div class="form-group">
            <label for="fecha_mantenimiento">Maintenance Date</label>
            <input type="date" id="fecha_mantenimiento" v-model="currentItem.fecha_mantenimiento" required />
          </div>
          <div class="form-group">
            <label for="costo">Cost</label>
            <input type="number" step="0.01" id="costo" v-model="currentItem.costo" required />
          </div>
          <div class="form-group">
            <label for="estado">State</label>
            <select id="estado" v-model="currentItem.estado">
              <option>Activo</option>
              <option>En Reparación</option>
              <option>De Baja</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit">Save</button>
          <button type="button" @click="cancelForm">Cancel</button>
        </div>
      </form>
    </div>

    <div v-if="isLoading">Loading...</div>
    <div v-if="error" class="error-message">{{ error }}</div>
    
    <div class="table-container">
      <table v-if="!isLoading && !error">
        <thead>
          <tr>
            <th>Type</th>
            <th>Brand</th>
            <th>Model</th>
            <th>Serial</th>
            <th>Maintenance</th>
            <th>OS Version</th>
            <th>Responsible</th>
            <th>Cost</th>
            <th>State</th>
            <th v-if="authStore.canCreateUpdateHardware || authStore.canDeleteHardware">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in hardwareItems" :key="item.id_hardware">
            <td>{{ item.tipo_equipo }}</td>
            <td>{{ item.marca }}</td>
            <td>{{ item.modelo }}</td>
            <td>{{ item.serie }}</td>
            <td>{{ new Date(item.fecha_mantenimiento).toLocaleDateString() }}</td>
            <td>{{ item.version_so }}</td>
            <td>{{ item.responsable }}</td>
            <td>${{ item.costo }}</td>
            <td>{{ item.estado }}</td>
            <td v-if="authStore.canCreateUpdateHardware || authStore.canDeleteHardware">
              <button v-if="authStore.canCreateUpdateHardware" @click="showEditForm(item)">Edit</button>
              <button v-if="authStore.canDeleteHardware" @click="deleteItem(item)" class="delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.subtitle {
  color: #555;
  margin-top: -10px;
  margin-bottom: 20px;
}
.table-container {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 0.9em;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  white-space: nowrap;
}
th {
  background-color: #f2f2f2;
}
.controls {
  margin-bottom: 20px;
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
.form-container {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
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
.filter-container {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}
.filter-group {
  display: flex;
  flex-direction: column;
}
.filter-group label {
  font-size: 0.85em;
  margin-bottom: 4px;
  color: #555;
}
.filter-group select,
.filter-group input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.clear-btn {
  margin-top: 15px;
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.clear-btn:hover {
  background-color: #5a6268;
}
</style>