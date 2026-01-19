import { ref, watch, type Ref } from 'vue'

/**
 * Debounce composable
 *
 * Creates a debounced version of a reactive value that only updates
 * after the specified delay has passed without changes.
 *
 * @param value - The reactive value to debounce
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns A ref containing the debounced value
 *
 * @example
 * ```ts
 * const searchQuery = ref('')
 * const debouncedSearch = useDebounce(searchQuery, 500)
 *
 * // In template: v-model="searchQuery"
 * // Watch debouncedSearch for API calls
 * watch(debouncedSearch, (value) => {
 *   fetchResults(value)
 * })
 * ```
 */
export function useDebounce<T>(value: Ref<T>, delay: number = 300): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(value, (newValue) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue
      timeoutId = null
    }, delay)
  })

  return debouncedValue
}

/**
 * Debounce function composable
 *
 * Creates a debounced version of a function that only executes
 * after the specified delay has passed without being called again.
 *
 * @param fn - The function to debounce
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns A debounced version of the function
 *
 * @example
 * ```ts
 * const handleSearch = useDebounceFn((query: string) => {
 *   fetchResults(query)
 * }, 500)
 *
 * // Call normally - will be debounced
 * handleSearch('test')
 * ```
 */
export function useDebounceFn<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}
