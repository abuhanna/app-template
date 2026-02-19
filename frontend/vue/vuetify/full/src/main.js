/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
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

// Styles
import 'unfonts.css'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
