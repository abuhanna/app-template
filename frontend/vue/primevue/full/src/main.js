/**
 * main.js
 *
 * Bootstraps PrimeVue and other plugins then mounts the App
 */

// Environment validation (fail-fast)
import { validateEnvironment } from '@/utils/envValidator'
validateEnvironment()

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// PrimeIcons
import 'primeicons/primeicons.css'
// PrimeFlex
import 'primeflex/primeflex.css'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
