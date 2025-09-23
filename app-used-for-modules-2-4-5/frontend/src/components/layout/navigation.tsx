import Link from 'next/link'
import { useRouter } from 'next/router'
import { cn } from '@/lib/utils'
import { useAuth } from '../contexts/AuthContext'
import {
  Home,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Newspaper,
  NotebookText,
} from 'lucide-react'

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and quick actions',
  },
  {
    label: 'Trips',
    href: '/trips',
    icon: MapPin,
    description: 'Plan your trips',
  },
  {
    label: 'Expenses',
    href: '/expenses',
    icon: DollarSign,
    description: 'Track your spending',
  },
  {
    label: 'Activities',
    href: '/activities',
    icon: Calendar,
    description: 'Schedule trip activities',
  },
  {
    label: 'Participants',
    href: '/participants',
    icon: Users,
    description: 'Manage trip participants',
  },
]

const secondaryItems = [
  {
    label: 'News',
    href: '/news',
    icon: Newspaper,
    description: 'View your news',
  },
  {
    label: 'Map',
    href: '/map',
    icon: MapPin,
    description: 'View your map',
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    description: 'View your calendar',
  },
  {
    label: 'Notes',
    href: '/notes',
    icon: NotebookText,
    description: 'View your notes',
  },
]

export function Navigation() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  if (!isAuthenticated || loading) {
    return null
  }
  return (
    <aside className="w-64 pr-8">
      <nav className="sticky top-6">
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main
          </h3>
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive =
              router.pathname === item.href ||
              (item.href !== '/dashboard' &&
                router.pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Icon
                  className={cn(
                    'flex-shrink-0 mr-3 h-5 w-5 transition-colors',
                    isActive
                      ? 'text-indigo-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-600">
                    {item.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
        <div className="mt-8 space-y-1">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Other
          </h3>
          {secondaryItems.map((item) => {
            const Icon = item.icon
            const isActive =
              router.pathname === item.href ||
              router.pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Icon
                  className={cn(
                    'flex-shrink-0 mr-3 h-5 w-5 transition-colors',
                    isActive
                      ? 'text-indigo-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-600">
                    {item.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
        <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-indigo-900">Quick Tip</p>
              <p className="text-xs text-indigo-700 mt-1">
                Track expenses as you go to stay on budget
              </p>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  )
}
