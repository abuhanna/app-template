import { beforeEach, describe, expect, it } from 'vitest'
import { useConfirmDialog } from '../useConfirmDialog'

describe('useConfirmDialog', () => {
  beforeEach(() => {
    // Reset shared state between tests
    const { handleCancel, isOpen } = useConfirmDialog()
    if (isOpen.value) {
      handleCancel()
    }
  })

  it('returns default values', () => {
    const { isOpen, dialogIcon, dialogColor } = useConfirmDialog()

    expect(isOpen.value).toBe(false)
    expect(dialogIcon.value).toBe('mdi-help-circle')
    expect(dialogColor.value).toBe('primary')
  })

  it('confirm opens dialog with provided options', () => {
    const { confirm, isOpen, dialogTitle, dialogMessage, dialogIcon, dialogColor } = useConfirmDialog()

    confirm({
      title: 'Delete Item',
      message: 'Are you sure?',
      icon: 'mdi-delete',
      color: 'error',
    })

    expect(isOpen.value).toBe(true)
    expect(dialogTitle.value).toBe('Delete Item')
    expect(dialogMessage.value).toBe('Are you sure?')
    expect(dialogIcon.value).toBe('mdi-delete')
    expect(dialogColor.value).toBe('error')
  })

  it('confirm uses default values when no options provided', () => {
    const { confirm, dialogTitle, dialogMessage, confirmText, cancelText } = useConfirmDialog()

    confirm()

    expect(dialogTitle.value).toBe('Confirm Action')
    expect(dialogMessage.value).toBe('Are you sure you want to proceed?')
    expect(confirmText.value).toBe('Confirm')
    expect(cancelText.value).toBe('Cancel')
  })

  it('handleConfirm resolves promise with true', async () => {
    const { confirm, handleConfirm } = useConfirmDialog()

    const promise = confirm({ title: 'Test' })
    handleConfirm()

    const result = await promise
    expect(result).toBe(true)
  })

  it('handleCancel resolves promise with false', async () => {
    const { confirm, handleCancel } = useConfirmDialog()

    const promise = confirm({ title: 'Test' })
    handleCancel()

    const result = await promise
    expect(result).toBe(false)
  })

  it('handleConfirm closes the dialog', async () => {
    const { confirm, handleConfirm, isOpen } = useConfirmDialog()

    confirm({ title: 'Test' })
    expect(isOpen.value).toBe(true)

    handleConfirm()
    expect(isOpen.value).toBe(false)
  })
})
