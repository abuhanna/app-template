<template>
  <div class="date-range-picker">
    <v-row dense align="center">
      <!-- From Date -->
      <v-col cols="12" :md="compact ? 6 : 5">
        <v-text-field
          v-model="fromDate"
          :label="fromLabel"
          type="date"
          :max="toDate || undefined"
          clearable
          hide-details
          density="compact"
          variant="outlined"
          prepend-inner-icon="mdi-calendar-start"
        />
      </v-col>

      <!-- To Date -->
      <v-col cols="12" :md="compact ? 6 : 5">
        <v-text-field
          v-model="toDate"
          :label="toLabel"
          type="date"
          :min="fromDate || undefined"
          clearable
          hide-details
          density="compact"
          variant="outlined"
          prepend-inner-icon="mdi-calendar-end"
        />
      </v-col>

      <!-- Presets Menu -->
      <v-col v-if="showPresets && !compact" cols="12" md="2">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="outlined"
              color="primary"
              block
              prepend-icon="mdi-calendar-clock"
            >
              Presets
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item
              v-for="preset in presetOptions"
              :key="preset.label"
              :title="preset.label"
              @click="applyPreset(preset)"
            />
            <v-divider />
            <v-list-item title="Clear" @click="clearDates" />
          </v-list>
        </v-menu>
      </v-col>

      <!-- Compact Presets (dropdown) -->
      <v-col v-if="showPresets && compact" cols="12" md="auto">
        <v-select
          v-model="selectedPreset"
          :items="presetSelectItems"
          label="Quick Select"
          hide-details
          density="compact"
          variant="outlined"
          clearable
          @update:model-value="handlePresetSelect"
        />
      </v-col>

      <!-- Clear Button (when not showing presets) -->
      <v-col v-if="!showPresets && (fromDate || toDate)" cols="12" md="auto">
        <v-btn
          variant="text"
          color="secondary"
          icon="mdi-close"
          size="small"
          @click="clearDates"
          title="Clear dates"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  /**
   * v-model for the date range object { from: string | null, to: string | null }
   */
  modelValue: {
    type: Object,
    default: () => ({ from: null, to: null }),
  },
  /**
   * Label for the from date field
   */
  fromLabel: {
    type: String,
    default: 'From Date',
  },
  /**
   * Label for the to date field
   */
  toLabel: {
    type: String,
    default: 'To Date',
  },
  /**
   * Show preset date range options
   */
  showPresets: {
    type: Boolean,
    default: true,
  },
  /**
   * Compact mode - uses dropdown for presets instead of menu
   */
  compact: {
    type: Boolean,
    default: false,
  },
  /**
   * Custom presets (overrides default presets)
   */
  presets: {
    type: Array,
    default: null,
  },
})

const emit = defineEmits([
  /**
   * Emitted when the date range changes
   */
  'update:modelValue',
  /**
   * Emitted when the date range changes
   */
  'change',
])

const fromDate = ref(props.modelValue?.from || null)
const toDate = ref(props.modelValue?.to || null)
const selectedPreset = ref(null)

// Default presets
const defaultPresets = [
  {
    label: 'Today',
    getValue: () => {
      const today = formatDate(new Date())
      return { from: today, to: today }
    },
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const formatted = formatDate(yesterday)
      return { from: formatted, to: formatted }
    },
  },
  {
    label: 'Last 7 Days',
    getValue: () => {
      const today = new Date()
      const weekAgo = new Date()
      weekAgo.setDate(today.getDate() - 7)
      return { from: formatDate(weekAgo), to: formatDate(today) }
    },
  },
  {
    label: 'Last 30 Days',
    getValue: () => {
      const today = new Date()
      const monthAgo = new Date()
      monthAgo.setDate(today.getDate() - 30)
      return { from: formatDate(monthAgo), to: formatDate(today) }
    },
  },
  {
    label: 'This Month',
    getValue: () => {
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: formatDate(firstDay), to: formatDate(today) }
    },
  },
  {
    label: 'Last Month',
    getValue: () => {
      const today = new Date()
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      return { from: formatDate(firstDayLastMonth), to: formatDate(lastDayLastMonth) }
    },
  },
]

const presetOptions = computed(() => props.presets || defaultPresets)

const presetSelectItems = computed(() => [
  ...presetOptions.value.map((p) => ({ title: p.label, value: p.label })),
])

// Watch for external model changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue?.from !== fromDate.value) {
      fromDate.value = newValue?.from || null
    }
    if (newValue?.to !== toDate.value) {
      toDate.value = newValue?.to || null
    }
  },
  { deep: true }
)

// Emit changes when dates change
watch([fromDate, toDate], ([newFrom, newTo]) => {
  const range = { from: newFrom, to: newTo }
  emit('update:modelValue', range)
  emit('change', range)
  // Clear preset selection when manually changing dates
  selectedPreset.value = null
})

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function applyPreset(preset) {
  const { from, to } = preset.getValue()
  fromDate.value = from
  toDate.value = to
  selectedPreset.value = preset.label
}

function handlePresetSelect(presetLabel) {
  if (!presetLabel) {
    clearDates()
    return
  }
  const preset = presetOptions.value.find((p) => p.label === presetLabel)
  if (preset) {
    applyPreset(preset)
  }
}

function clearDates() {
  fromDate.value = null
  toDate.value = null
  selectedPreset.value = null
}

// Expose methods for parent component
defineExpose({
  clearDates,
  applyPreset,
})
</script>

<style scoped>
.date-range-picker {
  width: 100%;
}
</style>
