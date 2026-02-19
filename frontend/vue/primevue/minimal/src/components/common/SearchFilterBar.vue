<template>
  <div class="search-filter-bar">
    <div class="flex flex-wrap align-items-center gap-3">
      <!-- Search Input -->
      <div :class="['search-input', searchClass]">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            class="w-full"
            @keyup.escape="handleClear"
          />
        </IconField>
        <Button
          v-if="searchQuery"
          icon="pi pi-times"
          text
          rounded
          severity="secondary"
          class="clear-search-btn"
          @click="handleClear"
        />
      </div>

      <!-- Additional Filters Slot -->
      <slot name="filters" />

      <!-- Actions -->
      <div v-if="showClearButton || $slots.actions" class="flex gap-2 align-items-center">
        <Button
          v-if="showClearButton && hasActiveFilters"
          label="Clear All"
          icon="pi pi-filter-slash"
          text
          severity="secondary"
          @click="clearAllFilters"
        />
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDebounce } from '@/composables/useDebounce'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

const props = defineProps({
  /**
   * Initial search value
   */
  modelValue: {
    type: String,
    default: '',
  },
  /**
   * Placeholder text for the search input
   */
  searchPlaceholder: {
    type: String,
    default: 'Search...',
  },
  /**
   * Debounce delay in milliseconds
   */
  debounceDelay: {
    type: Number,
    default: 300,
  },
  /**
   * CSS class for the search input wrapper
   */
  searchClass: {
    type: String,
    default: 'w-20rem',
  },
  /**
   * Show the clear all filters button
   */
  showClearButton: {
    type: Boolean,
    default: true,
  },
  /**
   * Indicates if there are active filters (used to show/hide clear button)
   */
  hasActiveFilters: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  /**
   * Emitted when the search value changes (debounced)
   */
  'update:modelValue',
  /**
   * Emitted when the search value changes (debounced)
   */
  'search',
  /**
   * Emitted when clear all filters button is clicked
   */
  'clear-all',
])

const searchQuery = ref(props.modelValue)
const debouncedSearch = useDebounce(searchQuery, props.debounceDelay)

// Watch for external model changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== searchQuery.value) {
      searchQuery.value = newValue
    }
  }
)

// Emit debounced search value
watch(debouncedSearch, (value) => {
  emit('update:modelValue', value)
  emit('search', value)
})

function handleClear() {
  searchQuery.value = ''
}

function clearAllFilters() {
  searchQuery.value = ''
  emit('clear-all')
}

// Expose methods for parent component
defineExpose({
  clearSearch: handleClear,
})
</script>

<style scoped>
.search-filter-bar {
  width: 100%;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
}

.clear-search-btn {
  position: absolute;
  right: 0.5rem;
}
</style>
