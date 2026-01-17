import { useEffect, useState, useMemo } from 'react'
import { Card } from 'primereact/card'
import { useAuthStore } from '@/stores/authStore'
import { usePersistentNotificationStore } from '@/stores/persistentNotificationStore'
import { useUserStore } from '@/stores/userStore'
import { useDepartmentStore } from '@/stores/departmentStore'
import './Dashboard.scss'

interface Stats {
  totalUsers: number
  totalDepartments: number
  activeUsers: number
  unreadNotifications: number
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const { unreadCount } = usePersistentNotificationStore()
  const { users, fetchUsers } = useUserStore()
  const { departments, fetchDepartments } = useDepartmentStore()

  const isAdmin = useMemo(() => user?.role === 'Admin', [user])

  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDepartments: 0,
    activeUsers: 0,
    unreadNotifications: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      if (isAdmin) {
        await Promise.all([fetchUsers(), fetchDepartments()])
      }
    }
    loadStats()
  }, [isAdmin, fetchUsers, fetchDepartments])

  useEffect(() => {
    setStats({
      totalUsers: users?.length || 0,
      totalDepartments: departments?.length || 0,
      activeUsers: users?.filter((u) => u.isActive).length || 0,
      unreadNotifications: unreadCount,
    })
  }, [users, departments, unreadCount])

  return (
    <div className="flex flex-column gap-4 p-3">
      {/* Stats Cards */}
      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="h-full">
            <div className="flex align-items-center gap-3">
              <div className="stat-icon users">
                <i className="pi pi-users text-2xl text-white"></i>
              </div>
              <div className="flex flex-column">
                <span className="text-3xl font-bold text-900 line-height-1">{stats.totalUsers}</span>
                <span className="text-sm text-500 mt-1">Total Users</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <Card className="h-full">
            <div className="flex align-items-center gap-3">
              <div className="stat-icon departments">
                <i className="pi pi-building text-2xl text-white"></i>
              </div>
              <div className="flex flex-column">
                <span className="text-3xl font-bold text-900 line-height-1">
                  {stats.totalDepartments}
                </span>
                <span className="text-sm text-500 mt-1">Departments</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <Card className="h-full">
            <div className="flex align-items-center gap-3">
              <div className="stat-icon active">
                <i className="pi pi-check-circle text-2xl text-white"></i>
              </div>
              <div className="flex flex-column">
                <span className="text-3xl font-bold text-900 line-height-1">{stats.activeUsers}</span>
                <span className="text-sm text-500 mt-1">Active Users</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <Card className="h-full">
            <div className="flex align-items-center gap-3">
              <div className="stat-icon notifications">
                <i className="pi pi-bell text-2xl text-white"></i>
              </div>
              <div className="flex flex-column">
                <span className="text-3xl font-bold text-900 line-height-1">
                  {stats.unreadNotifications}
                </span>
                <span className="text-sm text-500 mt-1">Unread Notifications</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
