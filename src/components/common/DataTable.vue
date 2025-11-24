<script setup>
defineProps({
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
  },
  sortKey: {
    type: String,
    default: ''
  },
  sortOrder: {
    type: String,
    default: 'asc'
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    default: 1
  }
});

defineEmits(['sort', 'page-change']);
</script>

<template>
  <div>
    <div v-if="isLoading">Loading data...</div>
    
    <div v-else-if="items.length > 0">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th 
                v-for="column in columns" 
                :key="column.key"
                @click="$emit('sort', column.key)"
                style="cursor: pointer; user-select: none;"
              >
                {{ column.label }}
                <span v-if="sortKey === column.key">
                  {{ sortOrder === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
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

      <div v-if="totalPages > 1" class="pagination-controls">
        <button 
          @click="$emit('page-change', currentPage - 1)" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          &lt;
        </button>

        <!-- First 2 pages -->
        <button 
          v-if="totalPages >= 1"
          @click="$emit('page-change', 1)"
          :class="['pagination-num', { active: currentPage === 1 }]"
        >
          1
        </button>
        <button 
          v-if="totalPages >= 2"
          @click="$emit('page-change', 2)"
          :class="['pagination-num', { active: currentPage === 2 }]"
        >
          2
        </button>

        <!-- Middle Input (only if totalPages > 4) -->
        <div v-if="totalPages > 4" class="pagination-input-container">
          <span v-if="currentPage > 3 && currentPage < totalPages - 2">...</span>
          <input 
            type="number" 
            :value="currentPage" 
            @change="(e) => $emit('page-change', Number(e.target.value))"
            min="1" 
            :max="totalPages"
            class="pagination-input"
            aria-label="Go to page"
          />
          <span v-if="currentPage > 3 && currentPage < totalPages - 2">...</span>
        </div>
        
        <!-- Last 2 pages -->
        <button 
          v-if="totalPages > 2 && totalPages > 3" 
          @click="$emit('page-change', totalPages - 1)"
          :class="['pagination-num', { active: currentPage === totalPages - 1 }]"
        >
          {{ totalPages - 1 }}
        </button>
        <button 
          v-if="totalPages > 2"
          @click="$emit('page-change', totalPages)"
          :class="['pagination-num', { active: currentPage === totalPages }]"
        >
          {{ totalPages }}
        </button>

        <button 
          @click="$emit('page-change', currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          &gt;
        </button>
      </div>
    </div>
    
    <div v-else>
      No items found
    </div>
  </div>
</template>

<style scoped>
.pagination-controls {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.pagination-btn, .pagination-num {
  padding: 6px 12px;
  background-color: white;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-dark);
  transition: all 0.2s;
  min-width: 32px;
}

.pagination-btn:disabled {
  background-color: #f5f5f5;
  color: #aaa;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover,
.pagination-num:hover {
  background-color: #f0f0f0;
  border-color: #ccc;
}

.pagination-num.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.pagination-input-container {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination-input {
  width: 50px;
  padding: 5px;
  text-align: center;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

/* Hide arrows in number input */
.pagination-input::-webkit-outer-spin-button,
.pagination-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.pagination-input {
  -moz-appearance: textfield;
}
</style>