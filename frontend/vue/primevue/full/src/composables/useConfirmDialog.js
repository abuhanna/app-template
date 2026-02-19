/**
 * useConfirmDialog composable for PrimeVue
 *
 * Provides a simple confirmation dialog using PrimeVue's ConfirmDialog component
 */

import { useConfirm } from 'primevue/useconfirm'

export function useConfirmDialog() {
  const confirm = useConfirm()

  const showConfirm = ({
    title = 'Confirm',
    message = 'Are you sure you want to proceed?',
    acceptLabel = 'Yes',
    rejectLabel = 'No',
    severity = 'warn',
  }) => {
    return new Promise((resolve) => {
      confirm.require({
        message,
        header: title,
        icon: severity === 'danger' ? 'pi pi-exclamation-triangle' : 'pi pi-question-circle',
        acceptLabel,
        rejectLabel,
        acceptClass: severity === 'danger' ? 'p-button-danger' : 'p-button-primary',
        accept: () => resolve(true),
        reject: () => resolve(false),
      })
    })
  }

  const confirmDelete = (itemName = 'this item') => {
    return showConfirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      severity: 'danger',
    })
  }

  return {
    showConfirm,
    confirmDelete,
  }
}
