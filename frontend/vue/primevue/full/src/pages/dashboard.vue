<template>
  <div class="flex flex-column gap-4 p-3">

    <!-- Stats Cards -->
    <!-- Stats Cards -->
    <div class="grid">
      <div class="col-12 md:col-6 lg:col-3">
        <Card class="h-full">
            <template #content>
            <div class="flex align-items-center gap-3">
                <div class="flex align-items-center justify-content-center w-4rem h-4rem border-round-xl stat-icon users">
                <i class="pi pi-users text-2xl text-white"></i>
                </div>
                <div class="flex flex-column">
                <span class="text-3xl font-bold text-900 line-height-1">{{ stats.totalUsers }}</span>
                <span class="text-sm text-500 mt-1">Total Users</span>
                </div>
            </div>
            </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <Card class="h-full">
            <template #content>
            <div class="flex align-items-center gap-3">
                <div class="flex align-items-center justify-content-center w-4rem h-4rem border-round-xl stat-icon departments">
                <i class="pi pi-building text-2xl text-white"></i>
                </div>
                <div class="flex flex-column">
                <span class="text-3xl font-bold text-900 line-height-1">{{ stats.totalDepartments }}</span>
                <span class="text-sm text-500 mt-1">Departments</span>
                </div>
            </div>
            </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <Card class="h-full">
            <template #content>
            <div class="flex align-items-center gap-3">
                <div class="flex align-items-center justify-content-center w-4rem h-4rem border-round-xl stat-icon active">
                <i class="pi pi-check-circle text-2xl text-white"></i>
                </div>
                <div class="flex flex-column">
                <span class="text-3xl font-bold text-900 line-height-1">{{ stats.activeUsers }}</span>
                <span class="text-sm text-500 mt-1">Active Users</span>
                </div>
            </div>
            </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <Card class="h-full">
            <template #content>
            <div class="flex align-items-center gap-3">
                <div class="flex align-items-center justify-content-center w-4rem h-4rem border-round-xl stat-icon notifications">
                <i class="pi pi-bell text-2xl text-white"></i>
                </div>
                <div class="flex flex-column">
                <span class="text-3xl font-bold text-900 line-height-1">{{ stats.unreadNotifications }}</span>
                <span class="text-sm text-500 mt-1">Unread Notifications</span>
                </div>
            </div>
            </template>
        </Card>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePersistentNotificationStore } from '@/stores/persistentNotification'
import { useUserStore } from '@/stores/user'
import { useDepartmentStore } from '@/stores/department'
import Card from 'primevue/card'

const authStore = useAuthStore()
const notificationStore = usePersistentNotificationStore()
const userStore = useUserStore()
const departmentStore = useDepartmentStore()

const isAdmin = computed(() => authStore.user?.role === 'Admin')

const stats = ref({
  totalUsers: 0,
  totalDepartments: 0,
  activeUsers: 0,
  unreadNotifications: 0,
})

const recentNotifications = computed(() => {
  return notificationStore.notifications.slice(0, 5)
})

const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}

onMounted(async () => {
  // Load stats
  if (isAdmin.value) {
    await Promise.all([userStore.fetchUsers(), departmentStore.fetchDepartments()])

    stats.value.totalUsers = userStore.users.length
    stats.value.totalDepartments = departmentStore.departments.length
    stats.value.activeUsers = userStore.users.filter((u) => u.isActive).length
  }

  stats.value.unreadNotifications = notificationStore.unreadCount
})
</script>

<style scoped>

.stat-icon.users {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.departments {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.notifications {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}


.quick-actions-card :deep(.p-card-title) {
  font-size: 1.125rem;
  font-weight: 600;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.activity-card :deep(.p-card-title) {
  font-size: 1.125rem;
  font-weight: 600;
}

.no-activity {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--p-text-muted-color);
  gap: 0.5rem;
}

.no-activity i {
  font-size: 2rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: var(--p-surface-50);
}

.activity-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: var(--p-primary-100);
  color: var(--p-primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.activity-title {
  font-weight: 500;
  color: var(--p-text-color);
}

.activity-message {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-time {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
}

.tech-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tech-list li {
  display: flex;
  align-items: center;
  color: var(--p-text-color);
}

.tech-list i {
  color: var(--p-primary-color);
  font-size: 1.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}
</style>
