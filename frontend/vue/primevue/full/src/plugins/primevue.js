/**
 * plugins/primevue.js
 *
 * Framework documentation: https://primevue.org
 */

// PrimeVue Theme - Aura (modern, clean look)
import Aura from '@primevue/themes/aura'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

import Tooltip from 'primevue/tooltip'

// PrimeIcons
import 'primeicons/primeicons.css'

export default {
  install (app) {
    app.use(PrimeVue, {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',

        },
      },
      ripple: true,
    })

    app.use(ToastService)
    app.use(ConfirmationService)
    app.directive('tooltip', Tooltip)
  },
}
