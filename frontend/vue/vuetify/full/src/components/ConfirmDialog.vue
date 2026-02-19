<template>
  <v-dialog
    v-model="isOpen"
    max-width="550"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center pa-6 pb-4">
        <v-avatar
          class="mr-4"
          :color="dialogColor"
          size="48"
        >
          <v-icon color="white" size="32">{{ dialogIcon }}</v-icon>
        </v-avatar>
        <div>
          <h2 class="text-h5 font-weight-bold">{{ dialogTitle }}</h2>
        </div>
      </v-card-title>

      <v-card-text class="px-6 pb-6 pt-2">
        <!-- Main Message -->
        <p v-if="mainMessage" class="text-body-1 mb-4">
          {{ mainMessage }}
        </p>

        <!-- Detail Information -->
        <v-card
          v-if="detailItems.length > 0"
          class="mb-4"
          color="grey-lighten-5"
          elevation="0"
          variant="flat"
        >
          <v-card-text class="pa-3">
            <v-list class="pa-0 bg-transparent" density="compact">
              <v-list-item
                v-for="(item, index) in detailItems"
                :key="index"
                class="px-2"
                min-height="32"
              >
                <template #prepend>
                  <v-icon class="mr-3" color="primary" size="small">mdi-circle-small</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  <span class="font-weight-bold">{{ item.label }}:</span>
                  <span class="ml-1">{{ item.value }}</span>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Warning/Info Message -->
        <v-alert
          v-if="warningMessage"
          class="mb-0"
          color="warning"
          density="compact"
          type="warning"
          variant="tonal"
        >
          {{ warningMessage }}
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          color="grey"
          size="large"
          variant="text"
          @click="handleCancel"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="dialogColor"
          size="large"
          variant="flat"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed } from 'vue'
  import { useConfirmDialog } from '@/composables/useConfirmDialog'

  const {
    isOpen,
    dialogTitle,
    dialogMessage,
    dialogIcon,
    dialogColor,
    confirmText,
    cancelText,
    handleConfirm,
    handleCancel,
  } = useConfirmDialog()

  // Parse message to extract main message, details, and warning
  const parsedMessage = computed(() => {
    if (!dialogMessage.value) {
      return { main: '', details: [], warning: '' }
    }

    const lines = dialogMessage.value.split('\n').filter(line => line.trim())
    const mainLines = []
    const detailLines = []
    const warningLines = []

    let section = 'main' // main, details, warning

    for (const line of lines) {
      const trimmed = line.trim()

      // Check if it's a detail item (starts with bullet point)
      if (trimmed.startsWith('•')) {
        section = 'details'
        detailLines.push(trimmed.slice(1).trim())
      } else if (
        trimmed.toLowerCase().includes('cannot be undone')
        || trimmed.toLowerCase().includes('permanently')
        || trimmed.toLowerCase().includes('redirected')
        || trimmed.toLowerCase().includes('will be')
      ) {
        section = 'warning'
        warningLines.push(trimmed)
      } else if (section === 'main') {
        mainLines.push(trimmed)
      } else if (section === 'warning') {
        warningLines.push(trimmed)
      }
    }

    return {
      main: mainLines.join(' '),
      details: detailLines,
      warning: warningLines.join(' '),
    }
  })

  const mainMessage = computed(() => parsedMessage.value.main)
  const warningMessage = computed(() => parsedMessage.value.warning)

  const detailItems = computed(() => {
    return parsedMessage.value.details.map(detail => {
      // Split by first colon to get label and value
      const colonIndex = detail.indexOf(':')
      if (colonIndex > 0) {
        return {
          label: detail.slice(0, Math.max(0, colonIndex)).trim(),
          value: detail.slice(Math.max(0, colonIndex + 1)).trim(),
        }
      }
      return { label: detail, value: '' }
    })
  })
</script>
