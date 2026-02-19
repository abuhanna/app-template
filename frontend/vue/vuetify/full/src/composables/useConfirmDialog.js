import { ref } from 'vue'

const isOpen = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
const dialogIcon = ref('mdi-help-circle')
const dialogColor = ref('primary')
const confirmText = ref('Confirm')
const cancelText = ref('Cancel')
const resolveCallback = ref(null)

export function useConfirmDialog () {
  const confirm = ({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    icon = 'mdi-help-circle',
    color = 'primary',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
  } = {}) => {
    dialogTitle.value = title
    dialogMessage.value = message
    dialogIcon.value = icon
    dialogColor.value = color
    confirmText.value = confirmLabel
    cancelText.value = cancelLabel
    isOpen.value = true

    return new Promise(resolve => {
      resolveCallback.value = resolve
    })
  }

  const handleConfirm = () => {
    isOpen.value = false
    if (resolveCallback.value) {
      resolveCallback.value(true)
      resolveCallback.value = null
    }
  }

  const handleCancel = () => {
    isOpen.value = false
    if (resolveCallback.value) {
      resolveCallback.value(false)
      resolveCallback.value = null
    }
  }

  return {
    isOpen,
    dialogTitle,
    dialogMessage,
    dialogIcon,
    dialogColor,
    confirmText,
    cancelText,
    confirm,
    handleConfirm,
    handleCancel,
  }
}
