<script setup>
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useInventory } from '@/composables/useInventory';

import PageWrapper from '@/components/common/PageWrapper.vue';
import DataTable from '@/components/common/DataTable.vue';
import ModalForm from '@/components/common/ModalForm.vue';
import AlertMessage from '@/components/common/AlertMessage.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import ConfirmDeleteModal from '@/components/common/ConfirmDeleteModal.vue';

const authStore = useAuthStore();

const inventoryConfig = {
  endpoint: 'hardware',
  itemIdKey: 'id_hardware',
  itemNameKey: 'modelo',
  initialFilters: {
    tipo_equipo_id_tipo: '',
    marca: '',
    fecha_mantenimiento: '',
    version_SO: '',
    responsable: '',
    estado: '',
  },
  initialFormState: {
    marca: '',
    modelo: '',
    serie: '',
    fecha_mantenimiento: new Date().toISOString().split('T')[0],
    version_SO: '',
    responsable: '',
    costo: 0.00,
    estado: 'Activo',
    tipo_equipo_id_tipo: 1,
  },
  transformIn: (item) => {
    const editableItem = { ...item };
    if (editableItem.fecha_mantenimiento) {
      editableItem.fecha_mantenimiento = new Date(item.fecha_mantenimiento).toISOString().split('T')[0];
    }
    editableItem.version_SO = item.version_so;
    return editableItem;
  },
  related: {
    filters: '/hardware/filters',
  },
};

const {
  items: hardwareItems,
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
  openDeleteModal,
  showCreateForm,
  showEditForm,
  cancelForm,
} = useInventory(inventoryConfig);

const filterOptions = computed(() => relatedData.value.filters || {});

const pageSubtitle = computed(() => {
  if (authStore.user?.scope_name === 'Owner') return "Viewing Hardware Department Inventory (Full Access)";
  if (authStore.user?.department_name === 'Hardware') return `Viewing Inventory for the ${authStore.user.department_name} Department`;
  return '';
});

const tableColumns = ref([
  { key: 'tipo_equipo', label: 'Type' },
  { key: 'marca', label: 'Brand' },
  { key: 'modelo', label: 'Model' },
  { key: 'serie', label: 'Serial' },
  { key: 'fecha_mantenimiento', label: 'Maintenance' },
  { key: 'version_so', label: 'OS Version' },
  { key: 'responsable', label: 'Responsible' },
  { key: 'costo', label: 'Cost' },
  { key: 'estado', label: 'State' },
]);

watch(filters, (val) => {
  console.log('HardwareInventoryPage:watch:filters', val);
});
</script>

<template>
  <PageWrapper title="Hardware Inventory">
    <p class="subtitle"><em>{{ pageSubtitle }}</em></p>

    <div class="filter-container">
      <div class="filter-grid">
        <div class="filter-group">
          <label for="filter-tipo">Type</label>
          <select id="filter-tipo" v-model="filters.tipo_equipo_id_tipo">
            <option value="">All</option>
            <option v-for="tipo in filterOptions.tipos" :key="tipo.id_tipo" :value="tipo.id_tipo">{{ tipo.tipo }}</option>
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
          <label for="filter-version_SO">OS Version</label>
          <select id="filter-version_SO" v-model="filters.version_SO">
            <option value="">All</option>
            <option v-for="ver in filterOptions.versiones_so" :key="ver" :value="ver">{{ ver }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-fecha">Maintenance Date</label>
          <input type="date" id="filter-fecha" v-model="filters.fecha_mantenimiento" />
        </div>
      </div>
      <BaseButton variant="secondary" @click="clearFilters" style="margin-top: 15px;">Clear Filters</BaseButton>
    </div>

    <div class="page-controls">
      <BaseButton v-if="authStore.permissions.hardware?.canCreate" @click="showCreateForm">
        Add New Hardware
      </BaseButton>
    </div>

    <AlertMessage type="success" :message="success" />
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
      <template #cell-costo="{ item }">
        ${{ Number(item.costo).toFixed(2) }}
      </template>
      <template #actions="{ item }">
        <BaseButton v-if="item.canBeEdited" variant="secondary" @click="showEditForm(item)">Edit</BaseButton>
        <BaseButton v-if="item.canBeDeleted" variant="danger" @click="openDeleteModal(item)">Delete</BaseButton>
      </template>
    </DataTable>

    <ModalForm
      :visible="showModal"
      :title="isEditing ? 'Edit Hardware' : 'Add New Hardware'"
      @save="handleSave"
      @close="cancelForm"
    >
      <div class="form-group">
        <label for="tipo_equipo_id_tipo">Type</label>
        <select id="tipo_equipo_id_tipo" v-model="currentItem.tipo_equipo_id_tipo" required>
          <option v-for="tipo in filterOptions.tipos" :key="tipo.id_tipo" :value="tipo.id_tipo">{{ tipo.tipo }}</option>
        </select>
      </div>
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
        <label for="version_SO">OS Version</label>
        <input id="version_SO" v-model="currentItem.version_SO" required />
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
    </ModalForm>

    <ConfirmDeleteModal
      :visible="!!itemToDelete"
      :item-name="itemToDelete ? `${itemToDelete.marca} ${itemToDelete.modelo}` : ''"
      @close="cancelForm"
      @confirm="handleConfirmDelete"
    />
  </PageWrapper>
</template>