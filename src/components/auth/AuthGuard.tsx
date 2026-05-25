import { Navigate } from '@tanstack/react-router'
import { useAuth } from '#/hooks/use-auth'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import type { UserRole } from '#/types/database'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  fallback?: string
}

export function AuthGuard({ children, allowedRoles, fallback = '/auth/login' }: AuthGuardProps) {
  const { isAuthenticated, isLoading, role, user } = useAuth()

  if (isLoading) return <PageLoader />

  if (!isAuthenticated || !user) {
    return <Navigate to={fallback} />
  }

  // Double-check suspended state defensively
  if (user.is_active === false) {
    return <Navigate to="/auth/login" />
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const target = role === 'admin'
      ? '/admin'
      : role === 'organiser'
        ? '/organiser'
        : '/dashboard'
    return <Navigate to={target} />
  }

  return <>{children}</>
}

export function RoleGuard({ children, roles }: { children: React.ReactNode; roles: UserRole[] }) {
  const { role, isLoading } = useAuth()

  if (isLoading) return <PageLoader />

  if (!role || !roles.includes(role)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="mt-2 text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
