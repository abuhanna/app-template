import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useConfirmDialog } from '../useConfirmDialog'

// Mock PrimeVue's useConfirm
const mockRequire = vi.fn()
vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => ({
    require: mockRequire,
  }),
}))

describe('useConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('showConfirm calls confirm.require with correct params', () => {
    const { showConfirm } = useConfirmDialog()

    showConfirm({
      title: 'Delete Item',
      message: 'Are you sure?',
      severity: 'danger',
    })

    expect(mockRequire).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Delete Item',
        message: 'Are you sure?',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
      }),
    )
  })

  it('showConfirm uses default values', () => {
    const { showConfirm } = useConfirmDialog()

    showConfirm({})

    expect(mockRequire).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Confirm',
        message: 'Are you sure you want to proceed?',
        icon: 'pi pi-question-circle',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        acceptClass: 'p-button-primary',
      }),
    )
  })

  it('showConfirm resolves true on accept', async () => {
    mockRequire.mockImplementation(options => {
      options.accept()
    })

    const { showConfirm } = useConfirmDialog()
    const result = await showConfirm({ title: 'Test' })

    expect(result).toBe(true)
  })

  it('showConfirm resolves false on reject', async () => {
    mockRequire.mockImplementation(options => {
      options.reject()
    })

    const { showConfirm } = useConfirmDialog()
    const result = await showConfirm({ title: 'Test' })

    expect(result).toBe(false)
  })

  it('confirmDelete calls showConfirm with danger severity', () => {
    const { confirmDelete } = useConfirmDialog()

    confirmDelete('this user')

    expect(mockRequire).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Confirm Delete',
        message: 'Are you sure you want to delete this user? This action cannot be undone.',
        acceptLabel: 'Delete',
        rejectLabel: 'Cancel',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
      }),
    )
  })

  it('confirmDelete uses default item name', () => {
    const { confirmDelete } = useConfirmDialog()

    confirmDelete()

    expect(mockRequire).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Are you sure you want to delete this item? This action cannot be undone.',
      }),
    )
  })
})
