import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BreadCrumb } from 'primereact/breadcrumb'
import { MenuItem } from 'primereact/menuitem'

function formatLabel(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function Breadcrumbs() {
  const location = useLocation()
  const navigate = useNavigate()

  const home: MenuItem = {
    icon: 'pi pi-home',
    command: () => navigate('/'),
  }

  const breadcrumbs: MenuItem[] = useMemo(() => {
    const paths = location.pathname.split('/').filter(Boolean)

    return paths.map((segment, index) => {
      const path = '/' + paths.slice(0, index + 1).join('/')
      const isLast = index === paths.length - 1

      return {
        label: formatLabel(segment),
        command: isLast ? undefined : () => navigate(path),
        disabled: isLast,
      }
    })
  }, [location.pathname, navigate])

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null
  }

  return (
    <div className="mb-3">
      <BreadCrumb model={breadcrumbs} home={home} className="surface-card border-round" />
    </div>
  )
}
