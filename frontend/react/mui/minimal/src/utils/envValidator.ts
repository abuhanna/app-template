/**
 * Validates required environment variables on application startup.
 * Throws an error with clear messages if any required variables are missing.
 */
export function validateEnvironment(): void {
  const errors: string[] = []

  // Required environment variables
  const required = ['VITE_API_BASE_URL']

  for (const key of required) {
    if (!import.meta.env[key]) {
      errors.push(`Missing required environment variable: ${key}`)
    }
  }

  // Validate API URL format
  const apiUrl = import.meta.env.VITE_API_BASE_URL
  if (apiUrl && !apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
    errors.push('VITE_API_BASE_URL must be a valid URL starting with http:// or https://')
  }

  // Throw if any validation errors
  if (errors.length > 0) {
    const errorMessage = errors.map((e) => `  - ${e}`).join('\n')
    console.error('Environment validation failed:\n' + errorMessage)
    throw new Error(
      `Environment validation failed:\n${errorMessage}\n\nPlease check your .env file.`
    )
  }
}
