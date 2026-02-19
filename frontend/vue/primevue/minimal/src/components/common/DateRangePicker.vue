<template>
  <div class="date-range-picker">
    <div class="flex flex-wrap align-items-center gap-3">
      <!-- From Date -->
      <div class="flex flex-column gap-1">
        <label v-if="showLabels" :for="fromId" class="text-sm font-medium">{{ fromLabel }}</label>
        <DatePicker
          :id="fromId"
          v-model="fromDate"
          :maxDate="toDate || undefined"
          :placeholder="fromLabel"
          showIcon
          iconDisplay="input"
          dateFormat="yy-mm-dd"
          showButtonBar
          :class="inputClass"
        />
      </div>

      <!-- To Date -->
      <div class="flex flex-column gap-1">
        <label v-if="showLabels" :for="toId" class="text-sm font-medium">{{ toLabel }}</label>
        <DatePicker
          :id="toId"
          v-model="toDate"
          :minDate="fromDate || undefined"
          :placeholder="toLabel"
          showIcon
          iconDisplay="input"
          dateFormat="yy-mm-dd"
          showButtonBar
          :class="inputClass"
        />
      </div>

      <!-- Presets -->
      <div v-if="showPresets" class="flex flex-column gap-1">
        <label v-if="showLabels" class="text-sm font-medium">&nbsp;</label>
        <Select
          v-model="selectedPreset"
          :options="presetSelectItems"
          optionLabel="label"
          optionValue="value"
          placeholder="Quick Select"
          showClear
          :class="inputClass"
          @update:model-value="handlePresetSelect"
        />
      </div>

      <!-- Clear Button (when not showing presets) -->
      <div v-if="!showPresets && (fromDate || toDate)" class="flex flex-column gap-1">
        <label v-if="showLabels" class="text-sm font-medium">&nbsp;</label>
        <Button
          icon="pi pi-times"
          text
          rounded
          severity="secondary"
          @click="clearDates"
          v-tooltip.top="'Clear dates'"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import Button from 'primevue/button'

const props = defineProps({
  /**
   * v-model for the date range object { from: Date | null, to: Date | null }
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
   * Show labels above the inputs
   */
  showLabels: {
    type: Boolean,
    default: false,
  },
  /**
   * Show preset date range options
   */
  showPresets: {
    type: Boolean,
    default: true,
  },
  /**
   * CSS class for inputs
   */
  inputClass: {
    type: String,
    default: 'w-10rem',
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

// Unique IDs for accessibility
const fromId = `from-date-${Math.random().toString(36).substring(2, 9)}`
const toId = `to-date-${Math.random().toString(36).substring(2, 9)}`

const fromDate = ref(props.modelValue?.from || null)
const toDate = ref(props.modelValue?.to || null)
const selectedPreset = ref(null)

// Default presets
const defaultPresets = [
  {
    label: 'Today',
    getValue: () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return { from: new Date(today), to: new Date(today) }
    },
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      return { from: new Date(yesterday), to: new Date(yesterday) }
    },
  },
  {
    label: 'Last 7 Days',
    getValue: () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 7)
      return { from: weekAgo, to: new Date(today) }
    },
  },
  {
    label: 'Last 30 Days',
    getValue: () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const monthAgo = new Date(today)
      monthAgo.setDate(today.getDate() - 30)
      return { from: monthAgo, to: new Date(today) }
    },
  },
  {
    label: 'This Month',
    getValue: () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: firstDay, to: new Date(today) }
    },
  },
  {
    label: 'Last Month',
    getValue: () => {
      const today = new Date()
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      return { from: firstDayLastMonth, to: lastDayLastMonth }
    },
  },
]

const presetOptions = computed(() => props.presets || defaultPresets)

const presetSelectItems = computed(() =>
  presetOptions.value.map((p) => ({ label: p.label, value: p.label }))
)

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

/**
 * Format date to ISO string (YYYY-MM-DD) for API calls
 */
function formatDateToString(date) {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get the date range as formatted strings
 */
function getFormattedRange() {
  return {
    from: formatDateToString(fromDate.value),
    to: formatDateToString(toDate.value),
  }
}

// Expose methods for parent component
defineExpose({
  clearDates,
  applyPreset,
  getFormattedRange,
})
</script>

<style scoped>
.date-range-picker {
  width: 100%;
}
</style>
