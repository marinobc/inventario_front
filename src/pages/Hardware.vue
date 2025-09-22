<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/services/api';

// Import reusable components
import PageWrapper from '@/components/common/PageWrapper.vue';
import DataTable from '@/components/common/DataTable.vue';
import ModalForm from '@/components/common/ModalForm.vue';
import AlertMessage from '@/components/common/AlertMessage.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import ConfirmDeleteModal from '@/components/common/ConfirmDeleteModal.vue';
import bannerHardwareImage from '@/assets/banner-hardware.jpg';

const authStore = useAuthStore();

// --- Component State ---
const hardwareItems = ref([]);
const isLoading = ref(true);
const error = ref('');

// --- Hardcoded State Options ---
const statusOptions = ref(["Activo", "Disponible", "En mantenimiento", "Dado de baja"]);

// --- Filter State ---
const initialFilters = {
  tipo_equipo_id_tipo: '',
  marca: '',
  fecha_mantenimiento: '',
  version_SO: '',
  responsable: '',
  estado: '',
  fecha_baja: '',
  ubicacion: '',
};
const filters = ref({ ...initialFilters });
const filterOptions = ref({
  tipos: [],
  marcas: [],
  versiones_so: [],
  responsables: [],
  estados: [],
  ubicaciones: [],
});

// --- State for Modals ---
const showFormModal = ref(false);
const isEditing = ref(false);
const currentItem = ref({});
const itemToDelete = ref(null);

// --- Computed property for the page subtitle ---
const pageSubtitle = computed(() => {
  if (authStore.user?.scope_name === 'Owner') {
    return "Viendo Inventario del Departamento de Hardware (Acceso Total)";
  }
  if (authStore.user?.department_name === 'Hardware') {
    return `Viendo Inventario para el Departamento de ${authStore.user.department_name}`;
  }
  return '';
});

// --- Table Columns Definition ---
const tableColumns = ref([
  { key: 'tipo_equipo', label: 'Tipo' },
  { key: 'marca', label: 'Marca' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'serie', label: 'Serie' },
  { key: 'ubicacion', label: 'Ubicación' },
  { key: 'fecha_mantenimiento', label: 'Mantenimiento' },
  { key: 'version_so', label: 'Versión SO' },
  { key: 'responsable', label: 'Responsable' },
  { key: 'costo', label: 'Costo' },
  { key: 'estado', label: 'Estado' },
  { key: 'fecha_baja', label: 'Fecha de Baja' },
]);

// --- API Functions with DEBUG LOGGING ---
async function fetchHardware() {
  console.log("[DEBUG] fetchHardware: Called.");
  isLoading.value = true;
  error.value = '';
  try {
    console.log("[DEBUG] fetchHardware: Making API call to '/hardware' with filters:", JSON.stringify(filters.value));
    const { data } = await apiClient.get('/hardware', { params: filters.value });
    console.log("[DEBUG] fetchHardware: API call successful. Received data:", data);
    hardwareItems.value = data;
  } catch (err) {
    console.error("[DEBUG] fetchHardware: API call FAILED. Full error object:", err);
    if (err.response) {
        console.error("[DEBUG] fetchHardware: Error response data:", err.response.data);
        console.error("[DEBUG] fetchHardware: Error response status:", err.response.status);
    } else if (err.request) {
        console.error("[DEBUG] fetchHardware: Error request data:", err.request);
    } else {
        console.error("[DEBUG] fetchHardware: General error message:", err.message);
    }
    error.value = 'Fallo al cargar los datos de hardware. Revise la consola del navegador para más detalles.';
  } finally {
    console.log("[DEBUG] fetchHardware: Reached 'finally' block. Setting isLoading to false.");
    isLoading.value = false;
  }
}

async function fetchFilterOptions() {
  console.log("[DEBUG] fetchFilterOptions: Called.");
  try {
    console.log("[DEBUG] fetchFilterOptions: Making API call to '/hardware/filters'.");
    const { data } = await apiClient.get('/hardware/filters');
    console.log("[DEBUG] fetchFilterOptions: API call successful. Received data:", data);
    filterOptions.value = data;
  } catch (err) {
    console.error("[DEBUG] fetchFilterOptions: API call FAILED.", err);
    error.value = 'Fallo al cargar las opciones de filtro.';
  }
}

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
    showFormModal.value = false;
    // --- MODIFIED: Fetch both table data and filter options ---
    await Promise.all([fetchHardware(), fetchFilterOptions()]);
  } catch (err) {
    error.value = `Fallo al guardar el hardware. ${err.response?.data?.message || ''}`;
    console.error(err);
  }
}

function openDeleteModal(item) {
  itemToDelete.value = item;
}

async function handleConfirmDelete() {
  if (!itemToDelete.value) return;
  try {
    await apiClient.delete(`/hardware/${itemToDelete.value.id_hardware}`);
    // --- MODIFIED: Fetch both table data and filter options ---
    await Promise.all([fetchHardware(), fetchFilterOptions()]);
  } catch (err) {
    error.value = 'Fallo al eliminar el item de hardware.';
    console.error(err);
  } finally {
    itemToDelete.value = null;
  }
}

function showCreateForm() {
  isEditing.value = false;
  currentItem.value = {
    marca: '',
    modelo: '',
    serie: '',
    ubicacion: '',
    fecha_mantenimiento: new Date().toISOString().split('T')[0],
    version_SO: '',
    responsable: '',
    costo: 0.00,
    estado: 'Activo',
    tipo_equipo_id_tipo: filterOptions.value.tipos[0]?.id_tipo || 1,
    fecha_baja: null,
  };
  showFormModal.value = true;
  error.value = '';
}

function showEditForm(item) {
  isEditing.value = true;
  const editableItem = { ...item };
  if (editableItem.fecha_mantenimiento) {
    editableItem.fecha_mantenimiento = new Date(item.fecha_mantenimiento).toISOString().split('T')[0];
  }
  if (editableItem.fecha_baja) {
    editableItem.fecha_baja = new Date(item.fecha_baja).toISOString().split('T')[0];
  } else {
    editableItem.fecha_baja = null;
  }
  editableItem.version_SO = item.version_so;
  editableItem.tipo_equipo_id_tipo = item.tipo_equipo_id_tipo;
  // --- MODIFIED: Explicitly set the estado to ensure the dropdown selects it ---
  editableItem.estado = item.estado;
  currentItem.value = editableItem;
  showFormModal.value = true;
  error.value = '';
}

function cancelForm() {
  showFormModal.value = false;
}

// --- Lifecycle Hook ---
onMounted(() => {
  console.log("[DEBUG] Component Mounted. Starting data fetch.");
  fetchHardware();
  fetchFilterOptions();
});
</script>



<template>
    <PageWrapper title="Inventario de Hardware" :banner-image="bannerHardwareImage">
    <template #actions>
      <Button class="btnNuevo" v-if="authStore.permissions.hardware?.canCreate" @click="showCreateForm">
        + Nuevo Recurso
      </Button>
    </template>

    <div class="filter-container">
      <div class="filter-grid">
        <div class="filter-group">
          <label for="filter-tipo">Tipo</label>
          <select id="filter-tipo" v-model="filters.tipo_equipo_id_tipo">
            <option value="">Todos</option>
            <option v-for="tipo in filterOptions.tipos" :key="tipo.id_tipo" :value="tipo.id_tipo">
              {{ tipo.tipo }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-marca">Marca</label>
          <select id="filter-marca" v-model="filters.marca">
            <option value="">Todas</option>
            <option v-for="marca in filterOptions.marcas" :key="marca" :value="marca">{{ marca }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-ubicacion">Ubicación</label>
          <select id="filter-ubicacion" v-model="filters.ubicacion">
            <option value="">Todas</option>
            <option v-for="loc in filterOptions.ubicaciones" :key="loc" :value="loc">{{ loc }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-estado">Estado</label>
          <select id="filter-estado" v-model="filters.estado">
            <option value="">Todos</option>
            <option v-for="estado in statusOptions" :key="estado" :value="estado">{{ estado }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-responsable">Responsable</label>
          <select id="filter-responsable" v-model="filters.responsable">
            <option value="">Todos</option>
            <option v-for="resp in filterOptions.responsables" :key="resp" :value="resp">{{ resp }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-version_SO">Versión SO</label>
          <select id="filter-version_SO" v-model="filters.version_SO">
            <option value="">Todas</option>
            <option v-for="ver in filterOptions.versiones_so" :key="ver" :value="ver">{{ ver }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-fecha">Fecha de Mantenimiento</label>
          <input type="date" id="filter-fecha" v-model="filters.fecha_mantenimiento" />
        </div>
        <div class="filter-group">
          <label for="filter-fecha-baja">Fecha de Baja</label>
          <input type="date" id="filter-fecha-baja" v-model="filters.fecha_baja" />
        </div>
      </div>
      <BaseButton class="btnClearF" @click="clearFilters" style="margin-top: 15px;">Limpiar Filtros</BaseButton>
    </div>

    <AlertMessage type="danger" :message="error" />

    <DataTable
      :items="hardwareItems"
      :columns="tableColumns"
      :is-loading="isLoading"
      :actions-visible="authStore.permissions.hardware?.canUpdate || authStore.permissions.hardware?.canDelete"
    >
      <template #cell-fecha_mantenimiento="{ item }">
        {{ new Date(item.fecha_mantenimiento).toLocaleDateString() }}
      </template>
      <template #cell-fecha_baja="{ item }">
        {{ item.fecha_baja ? new Date(item.fecha_baja).toLocaleDateString() : 'N/A' }}
      </template>
      <template #cell-costo="{ item }">
        ${{ Number(item.costo).toFixed(2) }}
      </template>
      <template #actions="{ item }">
        <BaseButton v-if="item.canBeEdited" class="btnEditar" style="background-color: #849CC4;" @click="showEditForm(item)">Editar</BaseButton>
        <BaseButton v-if="item.canBeDeleted" class="btnEliminar" style="background-color: #E02424;" @click="openDeleteModal(item)">Eliminar</BaseButton>
      </template>
    </DataTable>

    <ModalForm
      :visible="showFormModal"
      :title="isEditing ? 'Editar Hardware' : 'Añadir Nuevo Hardware'"
      @save="handleSave"
      @close="cancelForm"
    >
      <div class="form-group">
        <label for="tipo_equipo_id_tipo">Tipo</label>
        <select id="tipo_equipo_id_tipo" v-model="currentItem.tipo_equipo_id_tipo" required>
          <option v-for="tipo in filterOptions.tipos" :key="tipo.id_tipo" :value="tipo.id_tipo">
            {{ tipo.tipo }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="marca">Marca</label>
        <input id="marca" v-model="currentItem.marca" required />
      </div>
      <div class="form-group">
        <label for="modelo">Modelo</label>
        <input id="modelo" v-model="currentItem.modelo" required />
      </div>
      <div class="form-group">
        <label for="serie">Número de Serie</label>
        <input id="serie" v-model="currentItem.serie" required />
      </div>
      <div class="form-group">
        <label for="ubicacion">Ubicación</label>
        <input id="ubicacion" v-model="currentItem.ubicacion" />
      </div>
      <div class="form-group">
        <label for="responsable">Persona Responsable</label>
        <input id="responsable" v-model="currentItem.responsable" required />
      </div>
      <div class="form-group">
        <label for="version_SO">Versión SO</label>
        <input id="version_SO" v-model="currentItem.version_SO" required />
      </div>
      <div class="form-group">
        <label for="fecha_mantenimiento">Fecha de Mantenimiento</label>
        <input type="date" id="fecha_mantenimiento" v-model="currentItem.fecha_mantenimiento" required />
      </div>
      <div class="form-group">
        <label for="costo">Costo</label>
        <input type="number" step="0.01" id="costo" v-model="currentItem.costo" required />
      </div>
      <div class="form-group">
        <label for="estado">Estado</label>
        <select id="estado" v-model="currentItem.estado">
          <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="fecha_baja">Fecha de Baja</label>
        <input type="date" id="fecha_baja" v-model="currentItem.fecha_baja" />
      </div>
    </ModalForm>

    <ConfirmDeleteModal
      :visible="!!itemToDelete"
      :item-name="itemToDelete ? `${itemToDelete.marca} ${itemToDelete.modelo}` : ''"
      @close="itemToDelete = null"
      @confirm="handleConfirmDelete"
    />
  </PageWrapper>
</template>