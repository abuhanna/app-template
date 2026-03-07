import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce, useDebouncedCallback } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500))

    expect(result.current).toBe('hello')
  })

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    )

    // Change the value
    rerender({ value: 'world', delay: 500 })

    // Before delay, still old value
    expect(result.current).toBe('hello')

    // After delay, updated value
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('world')
  })
})

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays function call', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))

    act(() => {
      result.current('arg1')
    })

    // Not called yet
    expect(callback).not.toHaveBeenCalled()

    // After delay
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('arg1')
  })

  it('resets timer on repeated calls', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))

    act(() => {
      result.current('first')
    })

    // Advance halfway
    act(() => {
      vi.advanceTimersByTime(150)
    })

    // Call again - should reset timer
    act(() => {
      result.current('second')
    })

    // Advance past first timer but not second
    act(() => {
      vi.advanceTimersByTime(150)
    })

    // Should not have fired yet
    expect(callback).not.toHaveBeenCalled()

    // Advance past second timer
    act(() => {
      vi.advanceTimersByTime(150)
    })

    // Should fire with last call's args
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('second')
  })
})
