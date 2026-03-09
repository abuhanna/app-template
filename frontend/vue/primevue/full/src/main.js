/**
 * main.js
 *
 * Bootstraps PrimeVue and other plugins then mounts the App
 */

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

// Environment validation (fail-fast)
import { validateEnvironment } from '@/utils/envValidator'

// Components
import App from './App.vue'

// PrimeIcons
import 'primeicons/primeicons.css'
// PrimeFlex
import 'primeflex/primeflex.css'
validateEnvironment()

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
