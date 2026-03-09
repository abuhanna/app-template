import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useDebounce, useDebounceFn } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const source = ref('hello')
    const debounced = useDebounce(source, 300)

    expect(debounced.value).toBe('hello')
  })

  it('does not update value before delay', async () => {
    const source = ref('hello')
    const debounced = useDebounce(source, 300)

    source.value = 'world'
    await vi.advanceTimersByTimeAsync(100)

    expect(debounced.value).toBe('hello')
  })

  it('updates value after delay', async () => {
    const source = ref('hello')
    const debounced = useDebounce(source, 300)

    source.value = 'world'
    await vi.advanceTimersByTimeAsync(300)

    expect(debounced.value).toBe('world')
  })

  it('resets timer on rapid changes', async () => {
    const source = ref('a')
    const debounced = useDebounce(source, 300)

    source.value = 'b'
    await vi.advanceTimersByTimeAsync(200)

    source.value = 'c'
    await vi.advanceTimersByTimeAsync(200)

    // Only 200ms since last change, should still be 'a'
    expect(debounced.value).toBe('a')

    await vi.advanceTimersByTimeAsync(100)

    // Now 300ms since last change ('c')
    expect(debounced.value).toBe('c')
  })
})

describe('useDebounceFn', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays function execution', () => {
    const fn = vi.fn()
    const debouncedFn = useDebounceFn(fn, 300)

    debouncedFn('arg1')

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledWith('arg1')
  })

  it('only executes last call on rapid invocations', () => {
    const fn = vi.fn()
    const debouncedFn = useDebounceFn(fn, 300)

    debouncedFn('first')
    vi.advanceTimersByTime(100)
    debouncedFn('second')
    vi.advanceTimersByTime(100)
    debouncedFn('third')
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('third')
  })
})
