import { useState, useEffect, ReactNode, ChangeEvent } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
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
    <div
      className="surface-card p-3 border-round border-1 border-300 mb-3"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      <div className="p-inputgroup" style={{ width: 'auto', minWidth: '250px' }}>
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            placeholder={placeholder}
            value={internalValue}
            onChange={handleSearchChange}
            disabled={disabled}
            style={{ width: '100%' }}
          />
        </IconField>
        {internalValue && (
          <Button
            icon="pi pi-times"
            severity="secondary"
            text
            onClick={handleClearSearch}
            disabled={disabled}
            aria-label="Clear search"
          />
        )}
      </div>

      {children && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem',
            flex: 1,
          }}
        >
          {children}
        </div>
      )}

      {showClearAll && (
        <div style={{ marginLeft: 'auto' }}>
          <Button
            label="Clear All"
            icon="pi pi-filter-slash"
            severity="secondary"
            text
            onClick={handleClearAll}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}
