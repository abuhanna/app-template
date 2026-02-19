import { useState, MouseEvent } from 'react'
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material'
import {
  Download as DownloadIcon,
  KeyboardArrowDown as ArrowDownIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material'
import { useNotificationStore } from '@/stores'

interface ExportButtonProps {
  exportFn: (format: string, filters: Record<string, any>) => Promise<{ success: boolean; fileName: string }>
  filters?: Record<string, any>
  disabled?: boolean
  onExportStart?: (format: string) => void
  onExportComplete?: (result: { success: boolean; fileName: string }) => void
  onExportError?: (error: Error) => void
}

const formats = [
  { value: 'xlsx', label: 'Excel (.xlsx)', icon: ExcelIcon },
  { value: 'csv', label: 'CSV (.csv)', icon: CsvIcon },
  { value: 'pdf', label: 'PDF Report (.pdf)', icon: PdfIcon },
]

export function ExportButton({
  exportFn,
  filters = {},
  disabled = false,
  onExportStart,
  onExportComplete,
  onExportError,
}: ExportButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [loading, setLoading] = useState(false)
  const showSuccess = useNotificationStore((state) => state.showSuccess)
  const showError = useNotificationStore((state) => state.showError)

  const open = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleExport = async (format: string) => {
    handleClose()
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

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        disabled={disabled || loading}
        startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
        endIcon={<ArrowDownIcon />}
      >
        Export
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {formats.map((format) => (
          <MenuItem key={format.value} onClick={() => handleExport(format.value)}>
            <ListItemIcon>
              <format.icon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{format.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
