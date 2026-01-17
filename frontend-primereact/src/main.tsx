import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { PrimeReactProvider } from 'primereact/api'
import { router } from './router'
import { AppThemeProvider } from './components/providers/AppThemeProvider'

import 'primereact/resources/themes/lara-light-blue/theme.css'
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
