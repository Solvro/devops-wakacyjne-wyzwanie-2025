import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

export function useAuthRedirect() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    const publicRoutes = ['/auth/login', '/auth/register', '/']
    const isPublicRoute = publicRoutes.includes(router.pathname)
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/auth/login')
      return
    }
    if (
      isAuthenticated &&
      (router.pathname === '/auth/login' ||
        router.pathname === '/auth/register')
    ) {
      router.push('/dashboard')
      return
    }
  }, [isAuthenticated, loading, router])
  return { isAuthenticated, loading }
}
