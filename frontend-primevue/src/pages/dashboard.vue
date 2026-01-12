<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p class="welcome-text">Welcome back, {{ userName }}!</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon users">
              <i class="pi pi-users"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalUsers }}</span>
              <span class="stat-label">Total Users</span>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon departments">
              <i class="pi pi-building"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalDepartments }}</span>
              <span class="stat-label">Departments</span>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon active">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.activeUsers }}</span>
              <span class="stat-label">Active Users</span>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon notifications">
              <i class="pi pi-bell"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.unreadNotifications }}</span>
              <span class="stat-label">Unread Notifications</span>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Quick Actions -->
    <Card class="quick-actions-card">
      <template #title>Quick Actions</template>
      <template #content>
        <div class="quick-actions">
          <Button
            v-if="isAdmin"
            label="Add User"
            icon="pi pi-user-plus"
            @click="$router.push('/users')"
          />
          <Button
            v-if="isAdmin"
            label="Add Department"
            icon="pi pi-building"
            severity="secondary"
            @click="$router.push('/departments')"
          />
          <Button
            label="View Notifications"
            icon="pi pi-bell"
            severity="info"
            @click="$router.push('/notifications')"
          />
          <Button
            label="My Profile"
            icon="pi pi-user"
            severity="help"
            @click="$router.push('/profile')"
          />
        </div>
      </template>
    </Card>

    <!-- Recent Activity -->
    <Card class="activity-card">
      <template #title>Recent Activity</template>
      <template #content>
        <div v-if="recentNotifications.length === 0" class="no-activity">
          <i class="pi pi-inbox"></i>
          <span>No recent activity</span>
        </div>
        <div v-else class="activity-list">
          <div
            v-for="notification in recentNotifications"
            :key="notification.id"
            class="activity-item"
          >
            <div class="activity-icon">
              <i class="pi pi-bell"></i>
            </div>
            <div class="activity-content">
              <span class="activity-title">{{ notification.title }}</span>
              <span class="activity-message">{{ notification.message }}</span>
              <span class="activity-time">{{ formatTime(notification.createdAt) }}</span>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePersistentNotificationStore } from '@/stores/persistentNotification'
import { useUserStore } from '@/stores/user'
import { useDepartmentStore } from '@/stores/department'
import Card from 'primevue/card'
import Button from 'primevue/button'

const authStore = useAuthStore()
const notificationStore = usePersistentNotificationStore()
const userStore = useUserStore()
const departmentStore = useDepartmentStore()

const userName = computed(() => authStore.user?.name || authStore.user?.username || 'User')
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
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-header h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.welcome-text {
  margin: 0;
  color: var(--p-text-muted-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.stat-card :deep(.p-card-body) {
  padding: 1.25rem;
}

.stat-card :deep(.p-card-content) {
  padding: 0;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon i {
  font-size: 1.5rem;
  color: white;
}

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

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--p-text-color);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin-top: 0.25rem;
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
</style>
