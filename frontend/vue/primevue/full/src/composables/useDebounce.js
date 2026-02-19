import { ref, watch } from 'vue'

/**
 * Debounce composable
 *
 * Creates a debounced version of a reactive value that only updates
 * after the specified delay has passed without changes.
 *
 * @param {import('vue').Ref} value - The reactive value to debounce
 * @param {number} delay - Debounce delay in milliseconds (default: 300ms)
 * @returns {import('vue').Ref} A ref containing the debounced value
 *
 * @example
 * const searchQuery = ref('')
 * const debouncedSearch = useDebounce(searchQuery, 500)
 *
 * // In template: v-model="searchQuery"
 * // Watch debouncedSearch for API calls
 * watch(debouncedSearch, (value) => {
 *   fetchResults(value)
 * })
 */
export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value)
  let timeoutId = null

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
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Debounce delay in milliseconds (default: 300ms)
 * @returns {Function} A debounced version of the function
 *
 * @example
 * const handleSearch = useDebounceFn((query) => {
 *   fetchResults(query)
 * }, 500)
 *
 * // Call normally - will be debounced
 * handleSearch('test')
 */
export function useDebounceFn(fn, delay = 300) {
  let timeoutId = null

  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}
