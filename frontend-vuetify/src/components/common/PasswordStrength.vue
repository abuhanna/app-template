<template>
  <div class="password-strength">
    <v-progress-linear
      :model-value="strength"
      :color="strengthColor"
      height="8"
      rounded
    />
    <div class="d-flex justify-space-between mt-1">
      <span class="text-caption" :class="`text-${strengthColor}`">
        {{ strengthLabel }}
      </span>
      <span class="text-caption text-medium-emphasis">
        {{ requirements }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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

const strengthColor = computed(() => {
  if (passedChecks.value <= 2) return 'error'
  if (passedChecks.value <= 3) return 'warning'
  if (passedChecks.value <= 4) return 'info'
  return 'success'
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
</style>
