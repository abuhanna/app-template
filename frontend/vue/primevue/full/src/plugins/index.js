/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

import router from '@/router'
import pinia from '@/stores'
// Plugins
import primevue from './primevue'
import { i18n } from '@/i18n'

export function registerPlugins(app) {
  app.use(primevue).use(router).use(pinia).use(i18n)
}
