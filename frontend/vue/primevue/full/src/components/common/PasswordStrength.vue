<template>
  <div class="password-strength">
    <ProgressBar :value="strength" :showValue="false" :style="{ height: '8px' }" :class="progressClass" />
    <div class="flex justify-content-between mt-1">
      <span :class="['text-sm', textColorClass]">
        {{ strengthLabel }}
      </span>
      <span class="text-sm text-500">
        {{ requirements }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProgressBar from 'primevue/progressbar'

const props = defineProps({
  password: {
    type: String,
    default: ''
  }
})

const checks = computed(() => {
  const p = props.password || ''
  return {
    length: p.length >= 8,
    uppercase: /[A-Z]/.test(p),
    lowercase: /[a-z]/.test(p),
    number: /[0-9]/.test(p),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(p)
  }
})

const passedChecks = computed(() => {
  return Object.values(checks.value).filter(Boolean).length
})

const strength = computed(() => {
  return (passedChecks.value / 5) * 100
})

const progressClass = computed(() => {
  if (passedChecks.value <= 2) return 'strength-weak'
  if (passedChecks.value <= 3) return 'strength-fair'
  if (passedChecks.value <= 4) return 'strength-good'
  return 'strength-strong'
})

const textColorClass = computed(() => {
  if (passedChecks.value <= 2) return 'text-red-500'
  if (passedChecks.value <= 3) return 'text-orange-500'
  if (passedChecks.value <= 4) return 'text-blue-500'
  return 'text-green-500'
})

const strengthLabel = computed(() => {
  if (passedChecks.value <= 2) return 'Weak'
  if (passedChecks.value <= 3) return 'Fair'
  if (passedChecks.value <= 4) return 'Good'
  return 'Strong'
})

const requirements = computed(() => {
  const missing = []
  if (!checks.value.length) missing.push('8+ chars')
  if (!checks.value.uppercase) missing.push('uppercase')
  if (!checks.value.lowercase) missing.push('lowercase')
  if (!checks.value.number) missing.push('number')
  if (!checks.value.special) missing.push('special char')

  if (missing.length === 0) return 'All requirements met'
  return `Missing: ${missing.join(', ')}`
})
</script>

<style scoped>
.password-strength {
  margin-top: 4px;
}

:deep(.strength-weak .p-progressbar-value) {
  background: var(--red-500);
}

:deep(.strength-fair .p-progressbar-value) {
  background: var(--orange-500);
}

:deep(.strength-good .p-progressbar-value) {
  background: var(--blue-500);
}

:deep(.strength-strong .p-progressbar-value) {
  background: var(--green-500);
}
</style>
