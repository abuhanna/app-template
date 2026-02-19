import { useState, useRef } from 'react'
import { Button } from 'primereact/button'
import { Menu } from 'primereact/menu'
import { MenuItem } from 'primereact/menuitem'
import { useNotificationStore } from '@/stores'

interface ExportButtonProps {
  exportFn: (format: string, filters: Record<string, any>) => Promise<{ success: boolean; fileName: string }>
  filters?: Record<string, any>
  disabled?: boolean
  onExportStart?: (format: string) => void
  onExportComplete?: (result: { success: boolean; fileName: string }) => void
  onExportError?: (error: Error) => void
}

export function ExportButton({
  exportFn,
  filters = {},
  disabled = false,
  onExportStart,
  onExportComplete,
  onExportError,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false)
  const menuRef = useRef<Menu>(null)
  const showSuccess = useNotificationStore((state) => state.showSuccess)
  const showError = useNotificationStore((state) => state.showError)

  const handleExport = async (format: string) => {
    setLoading(true)
    onExportStart?.(format)

    try {
      const result = await exportFn(format, filters)
      showSuccess(`Exported successfully: ${result.fileName}`)
      onExportComplete?.(result)
    } catch (error) {
      console.error('Export failed:', error)
      showError('Export failed. Please try again.')
      onExportError?.(error as Error)
    } finally {
      setLoading(false)
    }
  }

  const menuItems: MenuItem[] = [
    {
      label: 'Export Format',
      items: [
        {
          label: 'Excel (.xlsx)',
          icon: 'pi pi-file-excel',
          command: () => handleExport('xlsx'),
        },
        {
          label: 'CSV (.csv)',
          icon: 'pi pi-file',
          command: () => handleExport('csv'),
        },
        {
          label: 'PDF Report (.pdf)',
          icon: 'pi pi-file-pdf',
          command: () => handleExport('pdf'),
        },
      ],
    },
  ]

  return (
    <>
      <Button
        label="Export"
        icon="pi pi-download"
        loading={loading}
        disabled={disabled}
        outlined
        onClick={(e) => menuRef.current?.toggle(e)}
      />
      <Menu ref={menuRef} model={menuItems} popup />
    </>
  )
}
