# Frontend - AppTemplate User Interface

Vue 3 + Vuetify 3 application for the AppTemplate scaffolding project.

## Tech Stack

- **Vue 3** - Progressive JavaScript framework (Composition API + Script Setup)
- **Vuetify 3** - Material Design component framework
- **Pinia** - Intuitive state management
- **Vue Router** - Official router with file-based routing
- **Vite** - Next-generation frontend tooling
- **Axios** - HTTP client for API calls
- **SignalR** - Real-time notifications

## Project Structure

```
frontend/
├── src/
│   ├── assets/               # Static assets (images, fonts)
│   ├── components/           # Reusable Vue components
│   │   └── AppSidebar.vue    # Navigation sidebar
│   │
│   ├── pages/                # File-based routing pages
│   │   ├── index.vue         # Home/Login redirect (/)
│   │   ├── login.vue         # Login page (/login)
│   │   ├── dashboard.vue     # Dashboard (/dashboard)
│   │   ├── users/            # User management
│   │   │   └── index.vue     # User list (/users)
│   │   ├── departments/      # Department management
│   │   │   └── index.vue     # Department list (/departments)
│   │   └── notifications/    # Notifications
│   │       └── index.vue     # Notification list (/notifications)
│   │
│   ├── layouts/              # Layout components
│   │   ├── default.vue       # Default layout (with sidebar)
│   │   └── auth.vue          # Auth layout (login)
│   │
│   ├── stores/               # Pinia stores
│   │   ├── auth.js           # Authentication state
│   │   ├── user.js           # User management
│   │   ├── department.js     # Department management
│   │   ├── notification.js   # Toast notifications
│   │   └── persistentNotification.js  # SignalR notifications
│   │
│   ├── services/             # API service layer
│   │   ├── api.js            # Axios instance & interceptors
│   │   ├── authApi.js        # Auth API calls
│   │   ├── userApi.js        # User API calls
│   │   ├── departmentApi.js  # Department API calls
│   │   └── notificationApi.js # Notification API calls
│   │
│   ├── composables/          # Composition functions
│   │
│   ├── plugins/              # Vue plugins
│   │   └── vuetify.js        # Vuetify configuration
│   │
│   ├── router/               # Router configuration
│   │   └── index.js          # Route guards
│   │
│   ├── styles/               # Global styles
│   │
│   ├── App.vue               # Root component
│   └── main.js               # Application entry point
│
├── public/                   # Public static assets
├── index.html                # HTML entry point
├── vite.config.js            # Vite configuration
└── package.json
```

## Quick Start

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Installation & Run

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Application will be available at http://localhost:3000

### Default Login

- **Username**: `admin`
- **Password**: `Admin@123`

## Development Commands

### Development

```bash
# Start dev server with hot-reload
npm run dev

# Start dev server with network access
npm run dev -- --host
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint errors
npm run lint --fix
```

## Component Development

### Auto-Import System

Components and composables are **automatically imported** - no need for manual imports!

**Example:**
```vue
<template>
  <!-- No import needed! -->
  <v-card>
    <AppSidebar />
  </v-card>
</template>

<script setup>
// Vuetify components auto-imported
// Custom components auto-imported from src/components/
</script>
```

### Creating New Component

**1. Create component file:**

```vue
<!-- src/components/UserCard.vue -->
<template>
  <v-card>
    <v-card-title>{{ user.name }}</v-card-title>
    <v-card-text>
      {{ user.email }}
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
/* Component-specific styles */
</style>
```

**2. Use component (auto-imported):**

```vue
<template>
  <UserCard :user="currentUser" />
</template>
```

## File-Based Routing

Routes are **automatically generated** from file structure in `src/pages/`.

### Route Examples

| File Path | URL | Description |
|-----------|-----|-------------|
| `pages/index.vue` | `/` | Home (redirects to dashboard or login) |
| `pages/login.vue` | `/login` | Login page |
| `pages/dashboard.vue` | `/dashboard` | Dashboard |
| `pages/users/index.vue` | `/users` | User management |
| `pages/departments/index.vue` | `/departments` | Department management |
| `pages/notifications/index.vue` | `/notifications` | Notifications |

### Creating New Page

**1. Create page file:**

```vue
<!-- src/pages/settings/index.vue -->
<template>
  <v-container>
    <h1>Settings</h1>
    <v-card>
      <!-- Settings form -->
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const settings = ref({})
</script>
```

**2. Route is automatically available at `/settings`**

### Dynamic Routes

```vue
<!-- src/pages/users/[id].vue -->
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const userId = route.params.id
</script>
```

## State Management with Pinia

### Store Structure

```javascript
// src/stores/user.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import userApi from '@/services/userApi'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Actions
  async function fetchUsers() {
    loading.value = true
    try {
      const response = await userApi.getUsers()
      users.value = response.data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createUser(userData) {
    const response = await userApi.createUser(userData)
    users.value.push(response.data)
    return response.data
  }

  // Return state and actions
  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser
  }
})
```

### Using Store in Component

```vue
<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// Access reactive state
const { users, loading } = storeToRefs(userStore)

// Call actions
onMounted(() => {
  userStore.fetchUsers()
})
</script>
```

## API Integration

### API Service Layer

All API calls go through service files in `src/services/`.

**API Service Example:**

```javascript
// src/services/userApi.js
import api from './api'

export default {
  getUsers() {
    return api.get('/users')
  },

  getUserById(id) {
    return api.get(`/users/${id}`)
  },

  createUser(data) {
    return api.post('/users', data)
  },

  updateUser(id, data) {
    return api.put(`/users/${id}`, data)
  },

  deleteUser(id) {
    return api.delete(`/users/${id}`)
  },

  changePassword(id, data) {
    return api.put(`/users/${id}/password`, data)
  }
}
```

### Axios Instance with Interceptors

```javascript
// src/services/api.js
import axios from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5100/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default api
```

## Layouts

### Using Layouts

```vue
<!-- src/pages/dashboard.vue -->
<template>
  <v-container>
    <h1>Dashboard</h1>
  </v-container>
</template>

<route lang="yaml">
meta:
  layout: default
</route>
```

### Available Layouts

- **default** - Main layout with sidebar navigation
- **auth** - Clean layout for login page

## Styling with Vuetify

### Vuetify Components

```vue
<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Card Title</v-card-title>
          <v-card-text>Card Content</v-card-text>
          <v-card-actions>
            <v-btn color="primary">Action</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
```

### Material Design Icons

```vue
<template>
  <v-icon>mdi-account</v-icon>
  <v-btn icon="mdi-delete" />
  <v-list-item prepend-icon="mdi-home">Home</v-list-item>
</template>
```

Browse icons: https://pictogrammers.com/library/mdi/

## Adding New Features

### Step-by-Step Example: Add "Products" Feature

**1. Create API Service**

```javascript
// src/services/productApi.js
import api from './api'

export default {
  getProducts() {
    return api.get('/products')
  },

  createProduct(data) {
    return api.post('/products', data)
  }
}
```

**2. Create Pinia Store**

```javascript
// src/stores/product.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import productApi from '@/services/productApi'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const loading = ref(false)

  async function fetchProducts() {
    loading.value = true
    try {
      const response = await productApi.getProducts()
      products.value = response.data
    } finally {
      loading.value = false
    }
  }

  return { products, loading, fetchProducts }
})
```

**3. Create Page**

```vue
<!-- src/pages/products/index.vue -->
<template>
  <v-container>
    <h1>Products</h1>
    <v-data-table
      :items="products"
      :loading="loading"
      :headers="headers"
    />
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()
const { products, loading } = storeToRefs(productStore)

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Price', key: 'price' }
]

onMounted(() => {
  productStore.fetchProducts()
})
</script>
```

**4. Add to Sidebar Navigation**

Update `src/components/AppSidebar.vue` to include the new menu item.

**5. Done!** Route automatically available at `/products`

## Authentication Flow

### Login

```vue
<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')

const handleLogin = async () => {
  await authStore.login(username.value, password.value)
  router.push('/dashboard')
}
</script>
```

### Protected Routes

Routes are protected via navigation guards in `src/router/index.js`:

```javascript
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)

  if (authRequired && !token) {
    next('/login')
  } else {
    next()
  }
})
```

### Logout

```vue
<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
```

## Real-time Notifications

AppTemplate includes SignalR integration for real-time notifications:

```javascript
// In src/stores/persistentNotification.js
import { HubConnectionBuilder } from '@microsoft/signalr'

const initSignalR = async () => {
  const hubUrl = `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/hubs/notifications`

  connection.value = new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => token
    })
    .withAutomaticReconnect()
    .build()

  connection.value.on('ReceiveNotification', notification => {
    // Handle new notification
  })

  await connection.value.start()
}
```

## Troubleshooting

### Common Issues

**"Module not found"**
- Run `npm install` to restore dependencies
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

**API calls failing (CORS)**
- Verify backend CORS policy
- Check `VITE_API_BASE_URL` in `.env`

**Components not auto-importing**
- Restart dev server
- Check component is in `src/components/` directory
- Verify `unplugin-vue-components` is configured in `vite.config.js`

**Build fails**
- Check Node.js version (requires 20+)
- Clear build cache: `rm -rf dist .vite`
- Clear npm cache: `npm cache clean --force`

**Vuetify styles not loading**
- Verify Vuetify plugin is registered in `main.js`
- Check import statements

### Development Tips

**Hot Module Replacement (HMR) not working**
- Save file again to trigger HMR
- Restart dev server: `npm run dev`

**Slow development server**
- Check file watcher limits (Linux): `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf`
- Exclude `node_modules` from IDE indexing

## Environment Variables

Create `.env` file in frontend root:

```bash
# API Base URL
VITE_API_BASE_URL=http://localhost:5100/api

# App Configuration
VITE_APP_TITLE=AppTemplate
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

## Best Practices

### Component Structure
- Use `<script setup>` syntax (concise and performant)
- Keep components small and focused
- Use props for parent-child communication
- Use events for child-parent communication
- Use stores for global state

### Performance
- Use `v-show` for frequent toggles, `v-if` for conditional rendering
- Lazy load routes and components
- Use `computed` for derived state
- Avoid deep watchers when possible

### Code Organization
- One component per file
- Group related components in folders
- Keep store actions focused
- Separate API logic in service layer

### Naming Conventions
- Components: PascalCase (e.g., `UserCard.vue`)
- Composables: camelCase with `use` prefix (e.g., `useAuth.js`)
- Stores: camelCase (e.g., `useUserStore`)
- Services: camelCase with Api suffix (e.g., `userApi.js`)

## Related Documentation

- [Vue 3 Documentation](https://vuejs.org/)
- [Vuetify 3 Documentation](https://vuetifyjs.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)

## Internal Documentation

- See root `README.md` for monorepo overview
- See `CLAUDE.md` for comprehensive development guide
- See `backend/README.md` for API documentation

---

**Questions?** Check the troubleshooting section or create an issue.
