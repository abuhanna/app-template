/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

import { i18n } from '@/i18n'
import router from '@/router'
import pinia from '@/stores'
// Plugins
import primevue from './primevue'

export function registerPlugins (app) {
  app.use(primevue).use(router).use(pinia).use(i18n)
}
