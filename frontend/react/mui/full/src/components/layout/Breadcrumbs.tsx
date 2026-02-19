import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Breadcrumbs as MuiBreadcrumbs, Typography, Box } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

function formatLabel(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function Breadcrumbs() {
  const location = useLocation()

  const breadcrumbs = useMemo(() => {
    const paths = location.pathname.split('/').filter(Boolean)

    return paths.map((segment, index) => ({
      label: formatLabel(segment),
      path: '/' + paths.slice(0, index + 1).join('/'),
      isLast: index === paths.length - 1,
    }))
  }, [location.pathname])

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null
  }

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        {breadcrumbs.map((crumb) =>
          crumb.isLast ? (
            <Typography key={crumb.path} color="text.primary">
              {crumb.label}
            </Typography>
          ) : (
            <Link
              key={crumb.path}
              to={crumb.path}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {crumb.label}
            </Link>
          )
        )}
      </MuiBreadcrumbs>
    </Box>
  )
}
