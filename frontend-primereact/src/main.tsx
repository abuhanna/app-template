// Environment validation (fail-fast)
import { validateEnvironment } from './utils/envValidator'
validateEnvironment()

// i18n initialization (must be imported early)
import './i18n'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { PrimeReactProvider } from 'primereact/api'
import { router } from './router'
import { AppThemeProvider } from './components/providers/AppThemeProvider'

// Theme is now loaded dynamically in index.html
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './styles/global.scss'

const primeReactConfig = {
  unstyled: false,
  ripple: true,
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider value={primeReactConfig}>
      <AppThemeProvider>
        <RouterProvider router={router} />
      </AppThemeProvider>
    </PrimeReactProvider>
  </StrictMode>
)
