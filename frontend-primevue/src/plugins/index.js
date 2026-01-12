/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

import router from '@/router'
import pinia from '@/stores'
// Plugins
import primevue from './primevue'

export function registerPlugins(app) {
  app.use(primevue).use(router).use(pinia)
}
