/**
 * plugins/primevue.js
 *
 * Framework documentation: https://primevue.org
 */

import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'

// PrimeVue Theme - Aura (modern, clean look)
import Aura from '@primevue/themes/aura'

// PrimeIcons
import 'primeicons/primeicons.css'

export default {
  install(app) {
    app.use(PrimeVue, {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: {
            name: 'primevue',
            order: 'tailwind-base, primevue, tailwind-utilities',
          },
        },
      },
      ripple: true,
    })

    app.use(ToastService)
    app.use(ConfirmationService)
    app.directive('tooltip', Tooltip)
  },
}
