<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="d-flex align-center">
            <v-icon class="mr-4" color="primary" size="48">mdi-account-group</v-icon>
            <div>
              <div class="text-h4">{{ userStore.items.length }}</div>
              <div class="text-subtitle-1 text-grey">Total Users</div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" text to="/users">View Users</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="d-flex align-center">
            <v-icon class="mr-4" color="success" size="48">mdi-office-building</v-icon>
            <div>
              <div class="text-h4">{{ departmentStore.items.length }}</div>
              <div class="text-subtitle-1 text-grey">Departments</div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn color="success" text to="/departments">View Departments</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="d-flex align-center">
            <v-icon class="mr-4" color="info" size="48">mdi-bell</v-icon>
            <div>
              <div class="text-h4">{{ persistentNotificationStore.unreadCount }}</div>
              <div class="text-subtitle-1 text-grey">Unread Notifications</div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn color="info" text to="/notifications">View Notifications</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { useDepartmentStore } from '@/stores/department'
  import { usePersistentNotificationStore } from '@/stores/persistentNotification'
  import { useUserStore } from '@/stores/user'

  const userStore = useUserStore()
  const departmentStore = useDepartmentStore()
  const persistentNotificationStore = usePersistentNotificationStore()

  // Load data on mount
  onMounted(async () => {
    await Promise.all([
      userStore.fetchUsers(),
      departmentStore.fetchDepartments(),
    ])
  })
</script>
