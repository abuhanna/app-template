import { Card } from 'primereact/card'
import { useAuthStore } from '@/stores/authStore'

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)

  return (
    <div>
      <div className="text-3xl font-bold mb-4">Dashboard</div>

      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="h-full">
            <div className="flex align-items-center justify-content-between">
              <div>
                <span className="block text-500 font-medium mb-2">Welcome</span>
                <div className="text-900 font-medium text-xl">
                  {user?.firstName} {user?.lastName}
                </div>
              </div>
              <div
                className="flex align-items-center justify-content-center border-round"
                style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'var(--blue-100)' }}
              >
                <i className="pi pi-user text-blue-500 text-xl" />
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <Card className="h-full">
            <div className="flex align-items-center justify-content-between">
              <div>
                <span className="block text-500 font-medium mb-2">Role</span>
                <div className="text-900 font-medium text-xl">{user?.role || 'User'}</div>
              </div>
              <div
                className="flex align-items-center justify-content-center border-round"
                style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'var(--green-100)' }}
              >
                <i className="pi pi-shield text-green-500 text-xl" />
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <Card className="h-full">
            <div className="flex align-items-center justify-content-between">
              <div>
                <span className="block text-500 font-medium mb-2">Department</span>
                <div className="text-900 font-medium text-xl">
                  {user?.departmentName || 'Not Assigned'}
                </div>
              </div>
              <div
                className="flex align-items-center justify-content-center border-round"
                style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'var(--orange-100)' }}
              >
                <i className="pi pi-building text-orange-500 text-xl" />
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <Card className="h-full">
            <div className="flex align-items-center justify-content-between">
              <div>
                <span className="block text-500 font-medium mb-2">Email</span>
                <div className="text-900 font-medium text-xl truncate" style={{ maxWidth: '180px' }}>
                  {user?.email}
                </div>
              </div>
              <div
                className="flex align-items-center justify-content-center border-round"
                style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'var(--purple-100)' }}
              >
                <i className="pi pi-envelope text-purple-500 text-xl" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-4">
        <div className="text-xl font-semibold mb-3">Quick Start Guide</div>
        <p className="text-600 line-height-3">
          Welcome to your dashboard! This template provides a solid foundation for building
          applications with React, PrimeReact, and a .NET backend. Explore the sidebar navigation to
          manage users, departments, and notifications.
        </p>
        <ul className="text-600 pl-4 line-height-3">
          <li>View and manage users in the Users section</li>
          <li>Organize departments in the Departments section</li>
          <li>Check your notifications for updates</li>
          <li>Update your profile settings</li>
        </ul>
      </Card>
    </div>
  )
}
