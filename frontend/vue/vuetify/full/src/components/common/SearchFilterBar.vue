<template>
  <v-card flat>
    <v-card-text class="pa-0">
      <v-row align="center" dense>
        <!-- Search Input -->
        <v-col cols="12" :md="searchColSpan">
          <v-text-field
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            density="compact"
            variant="outlined"
            @click:clear="handleClear"
          />
        </v-col>

        <!-- Additional Filters Slot -->
        <slot name="filters" />

        <!-- Actions -->
        <v-col v-if="showClearButton || $slots.actions" cols="12" md="auto" class="d-flex gap-2">
          <v-btn
            v-if="showClearButton && hasActiveFilters"
            variant="text"
            color="secondary"
            prepend-icon="mdi-filter-remove"
            @click="clearAllFilters"
          >
            Clear All
          </v-btn>
          <slot name="actions" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useDebounce } from '@/composables/useDebounce'

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
   * Number of columns for the search input (out of 12)
   */
  searchColSpan: {
    type: [Number, String],
    default: 4,
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
