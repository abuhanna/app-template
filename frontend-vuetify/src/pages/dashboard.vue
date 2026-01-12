<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Dashboard</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="d-flex align-center">
            <v-icon size="48" color="primary" class="mr-4">mdi-account-group</v-icon>
            <div>
              <div class="text-h4">{{ userStore.items.length }}</div>
              <div class="text-subtitle-1 text-grey">Total Users</div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary" to="/users">View Users</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="d-flex align-center">
            <v-icon size="48" color="success" class="mr-4">mdi-office-building</v-icon>
            <div>
              <div class="text-h4">{{ departmentStore.items.length }}</div>
              <div class="text-subtitle-1 text-grey">Departments</div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="success" to="/departments">View Departments</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="d-flex align-center">
            <v-icon size="48" color="info" class="mr-4">mdi-bell</v-icon>
            <div>
              <div class="text-h4">{{ persistentNotificationStore.unreadCount }}</div>
              <div class="text-subtitle-1 text-grey">Unread Notifications</div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="info" to="/notifications">View Notifications</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>Welcome to AppTemplate</v-card-title>
          <v-card-text>
            <p>
              This is a fullstack application template built with:
            </p>
            <v-list>
              <v-list-item prepend-icon="mdi-server">
                <v-list-item-title>Backend: .NET 8 with Clean Architecture</v-list-item-title>
              </v-list-item>
              <v-list-item prepend-icon="mdi-vuejs">
                <v-list-item-title>Frontend: Vue 3 + Vuetify 3 + Vite</v-list-item-title>
              </v-list-item>
              <v-list-item prepend-icon="mdi-database">
                <v-list-item-title>Database: PostgreSQL with Entity Framework Core</v-list-item-title>
              </v-list-item>
              <v-list-item prepend-icon="mdi-lock">
                <v-list-item-title>Authentication: JWT with local users + optional SSO</v-list-item-title>
              </v-list-item>
              <v-list-item prepend-icon="mdi-bell-ring">
                <v-list-item-title>Real-time: SignalR for notifications</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useDepartmentStore } from '@/stores/department'
import { usePersistentNotificationStore } from '@/stores/persistentNotification'

const userStore = useUserStore()
const departmentStore = useDepartmentStore()
const persistentNotificationStore = usePersistentNotificationStore()

// Load data on mount
onMounted(async () => {
  await Promise.all([
    userStore.fetchUsers(),
    departmentStore.fetchDepartments()
  ])
})
</script>
