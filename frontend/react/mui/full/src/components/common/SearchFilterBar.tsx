import { useState, useEffect, ReactNode, ChangeEvent } from 'react'
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Paper,
} from '@mui/material'
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'
import { useDebounce } from '@/hooks'

interface SearchFilterBarProps {
  /** Current search value */
  value?: string
  /** Callback when search value changes (debounced) */
  onChange?: (value: string) => void
  /** Callback to clear all filters */
  onClearAll?: () => void
  /** Placeholder text for search input */
  placeholder?: string
  /** Debounce delay in milliseconds */
  debounceMs?: number
  /** Additional filter controls to render */
  children?: ReactNode
  /** Show clear all button */
  showClearAll?: boolean
  /** Disable the search input */
  disabled?: boolean
}

export function SearchFilterBar({
  value = '',
  onChange,
  onClearAll,
  placeholder = 'Search...',
  debounceMs = 300,
  children,
  showClearAll = true,
  disabled = false,
}: SearchFilterBarProps) {
  const [internalValue, setInternalValue] = useState(value)
  const debouncedValue = useDebounce(internalValue, debounceMs)

  // Sync internal value with external value prop
  useEffect(() => {
    setInternalValue(value)
  }, [value])

  // Notify parent when debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange?.(debouncedValue)
    }
  }, [debouncedValue, onChange, value])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalValue(event.target.value)
  }

  const handleClearSearch = () => {
    setInternalValue('')
    onChange?.('')
  }

  const handleClearAll = () => {
    handleClearSearch()
    onClearAll?.()
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        gap: 2,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <TextField
        size="small"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleSearchChange}
        disabled={disabled}
        sx={{ minWidth: 250, flexShrink: 0 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: internalValue ? (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={handleClearSearch}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <ClearIcon fontSize="small" />
                </Button>
              </InputAdornment>
            ) : null,
          },
        }}
      />

      {children && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            flexGrow: 1,
          }}
        >
          {children}
        </Box>
      )}

      {showClearAll && (
        <Box sx={{ flexShrink: 0, ml: { md: 'auto' } }}>
          <Button
            variant="text"
            color="secondary"
            startIcon={<ClearIcon />}
            onClick={handleClearAll}
            disabled={disabled}
          >
            Clear All
          </Button>
        </Box>
      )}
    </Paper>
  )
}
