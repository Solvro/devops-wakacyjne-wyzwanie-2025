import { ReactNode } from 'react'
import { Navigation } from './navigation'
import { Header } from './header'
import { Footer } from './footer'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated, loading } = useAuth()
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="flex">
          <Navigation />
          <div className={`flex-1 ${isAuthenticated ? 'ml-4' : ''}`}>
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
