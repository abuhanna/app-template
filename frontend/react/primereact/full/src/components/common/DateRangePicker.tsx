import { useMemo, useRef } from 'react'
import { Calendar } from 'primereact/calendar'
import { Button } from 'primereact/button'
import { Menu } from 'primereact/menu'
import { MenuItem } from 'primereact/menuitem'
import { Nullable } from 'primereact/ts-helpers'

export interface DateRange {
  from: Date | null
  to: Date | null
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
  /** Date format for display */
  dateFormat?: string
}

interface DatePreset {
  label: string
  getValue: () => DateRange
}

const getPresets = (): DatePreset[] => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return [
    {
      label: 'Today',
      getValue: () => ({
        from: new Date(today),
        to: new Date(today),
      }),
    },
    {
      label: 'Last 7 days',
      getValue: () => {
        const from = new Date(today)
        from.setDate(from.getDate() - 6)
        return {
          from,
          to: new Date(today),
        }
      },
    },
    {
      label: 'Last 30 days',
      getValue: () => {
        const from = new Date(today)
        from.setDate(from.getDate() - 29)
        return {
          from,
          to: new Date(today),
        }
      },
    },
    {
      label: 'This month',
      getValue: () => {
        const from = new Date(today.getFullYear(), today.getMonth(), 1)
        const to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return {
          from,
          to,
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
  dateFormat = 'yy-mm-dd',
}: DateRangePickerProps) {
  const menuRef = useRef<Menu>(null)
  const presets = useMemo(() => getPresets(), [])

  const handlePresetSelect = (preset: DatePreset) => {
    onChange(preset.getValue())
  }

  const handleFromChange = (date: Nullable<Date>) => {
    onChange({
      ...value,
      from: date || null,
    })
  }

  const handleToChange = (date: Nullable<Date>) => {
    onChange({
      ...value,
      to: date || null,
    })
  }

  const handleClear = () => {
    onChange({ from: null, to: null })
  }

  const hasValue = value.from || value.to

  const menuItems: MenuItem[] = [
    {
      label: 'Date Presets',
      items: presets.map((preset) => ({
        label: preset.label,
        command: () => handlePresetSelect(preset),
      })),
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}
    >
      <span className="p-float-label">
        <Calendar
          id="from-date"
          value={value.from}
          onChange={(e) => handleFromChange(e.value as Nullable<Date>)}
          dateFormat={dateFormat}
          disabled={disabled}
          maxDate={value.to || undefined}
          showIcon
          showButtonBar
          style={{ width: '170px' }}
        />
        <label htmlFor="from-date">{fromLabel}</label>
      </span>

      <span style={{ color: 'var(--text-color-secondary)' }}>-</span>

      <span className="p-float-label">
        <Calendar
          id="to-date"
          value={value.to}
          onChange={(e) => handleToChange(e.value as Nullable<Date>)}
          dateFormat={dateFormat}
          disabled={disabled}
          minDate={value.from || undefined}
          showIcon
          showButtonBar
          style={{ width: '170px' }}
        />
        <label htmlFor="to-date">{toLabel}</label>
      </span>

      {showPresets && (
        <>
          <Button
            label="Presets"
            icon="pi pi-calendar"
            severity="secondary"
            outlined
            size="small"
            onClick={(e) => menuRef.current?.toggle(e)}
            disabled={disabled}
          />
          <Menu ref={menuRef} model={menuItems} popup />
        </>
      )}

      {showClear && hasValue && (
        <Button
          icon="pi pi-times"
          severity="secondary"
          text
          rounded
          size="small"
          onClick={handleClear}
          disabled={disabled}
          aria-label="Clear dates"
          tooltip="Clear dates"
          tooltipOptions={{ position: 'top' }}
        />
      )}
    </div>
  )
}
