// Environment validation (fail-fast)
import { validateEnvironment } from './utils/envValidator'
validateEnvironment()

// i18n initialization (must be imported early)
import './i18n'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AppThemeProvider } from './components/providers/AppThemeProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <RouterProvider router={router} />
    </AppThemeProvider>
  </StrictMode>
)
