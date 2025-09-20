<script setup>
import { watch } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  actionsVisible: {
    type: Boolean,
    default: false
  }
});

watch(() => props.items, (val) => {
  console.log('DataTable:watch:items', val);
});

watch(() => props.isLoading, (val) => {
  console.log('DataTable:watch:isLoading', val);
});
</script>

<template>
  <div>
    <div v-if="isLoading">Loading data...</div>
    
    <div v-else-if="items.length > 0" class="table-container">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
            <th v-if="actionsVisible">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id || item.id_hardware">
            <td v-for="column in columns" :key="column.key">
              <slot :name="`cell-${column.key}`" :item="item">
                {{ item[column.key] }}
              </slot>
            </td>
            <td v-if="actionsVisible">
              <slot name="actions" :item="item"></slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-else>
      No items found
    </div>
  </div>
</template>