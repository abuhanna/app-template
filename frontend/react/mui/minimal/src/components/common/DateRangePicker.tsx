import { useMemo } from 'react'
import {
  Box,
  TextField,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Typography,
} from '@mui/material'
import {
  Clear as ClearIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material'
import { useState, MouseEvent, ChangeEvent } from 'react'

export interface DateRange {
  from: string | null
  to: string | null
}

interface DateRangePickerProps {
  /** Current date range value */
  value: DateRange
  /** Callback when date range changes */
  onChange: (value: DateRange) => void
  /** Label for the from date field */
  fromLabel?: string
  /** Label for the to date field */
  toLabel?: string
  /** Disable the date pickers */
  disabled?: boolean
  /** Show presets dropdown */
  showPresets?: boolean
  /** Show clear button */
  showClear?: boolean
  /** Size of the input fields */
  size?: 'small' | 'medium'
}

interface DatePreset {
  label: string
  getValue: () => DateRange
}

const getPresets = (): DatePreset[] => {
  const today = new Date()
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  return [
    {
      label: 'Today',
      getValue: () => ({
        from: formatDate(today),
        to: formatDate(today),
      }),
    },
    {
      label: 'Last 7 days',
      getValue: () => {
        const from = new Date(today)
        from.setDate(from.getDate() - 6)
        return {
          from: formatDate(from),
          to: formatDate(today),
        }
      },
    },
    {
      label: 'Last 30 days',
      getValue: () => {
        const from = new Date(today)
        from.setDate(from.getDate() - 29)
        return {
          from: formatDate(from),
          to: formatDate(today),
        }
      },
    },
    {
      label: 'This month',
      getValue: () => {
        const from = new Date(today.getFullYear(), today.getMonth(), 1)
        const to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return {
          from: formatDate(from),
          to: formatDate(to),
        }
      },
    },
  ]
}

export function DateRangePicker({
  value,
  onChange,
  fromLabel = 'From',
  toLabel = 'To',
  disabled = false,
  showPresets = true,
  showClear = true,
  size = 'small',
}: DateRangePickerProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const presets = useMemo(() => getPresets(), [])

  const handlePresetsClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePresetsClose = () => {
    setAnchorEl(null)
  }

  const handlePresetSelect = (preset: DatePreset) => {
    onChange(preset.getValue())
    handlePresetsClose()
  }

  const handleFromChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      from: event.target.value || null,
    })
  }

  const handleToChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      to: event.target.value || null,
    })
  }

  const handleClear = () => {
    onChange({ from: null, to: null })
  }

  const hasValue = value.from || value.to

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
      }}
    >
      <TextField
        type="date"
        size={size}
        label={fromLabel}
        value={value.from || ''}
        onChange={handleFromChange}
        disabled={disabled}
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { max: value.to || undefined },
        }}
        sx={{ minWidth: 150 }}
      />

      <Typography variant="body2" color="text.secondary">
        -
      </Typography>

      <TextField
        type="date"
        size={size}
        label={toLabel}
        value={value.to || ''}
        onChange={handleToChange}
        disabled={disabled}
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { min: value.from || undefined },
        }}
        sx={{ minWidth: 150 }}
      />

      {showPresets && (
        <>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DateRangeIcon />}
            onClick={handlePresetsClick}
            disabled={disabled}
            sx={{ textTransform: 'none' }}
          >
            Presets
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handlePresetsClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            {presets.map((preset) => (
              <MenuItem
                key={preset.label}
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}

      {showClear && hasValue && (
        <IconButton
          size="small"
          onClick={handleClear}
          disabled={disabled}
          title="Clear dates"
        >
          <ClearIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  )
}
