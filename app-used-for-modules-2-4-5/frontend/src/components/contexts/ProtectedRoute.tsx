import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from './AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router, requireAuth])
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  if (requireAuth && !isAuthenticated) {
    return null
  }
  return <>{children}</>
}
