import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useRouter } from 'next/router'
import {
  authApi,
  userApi,
  tokenManager,
  type LoginDto,
  type RegisterDto,
  type AuthResponseDto,
  type UpdateUserDto,
} from '@/lib/api'

export interface User {
  email: string
  username: string | null
  role: string
  note: string | null
  updatedAt: Date
  createdAt: Date
  isArchived: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    username: string,
    password: string,
    note?: string
  ) => Promise<void>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
  updateUser: (data: { username?: string; note?: string }) => Promise<void>
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenManager.getToken()
      if (token) {
        try {
          setLoading(false)
        } catch (error) {
          console.error('Token validation failed:', error)
          tokenManager.removeToken()
          setUser(null)
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      const loginData: LoginDto = { email, password }
      const response: AuthResponseDto = await authApi.login(loginData)
      tokenManager.setToken(response.token)
      try {
        const userData = await userApi.getByEmail(email)
        setUser(userData)
      } catch {
        setUser({
          email,
          username: null,
          role: 'USER',
          note: null,
          updatedAt: new Date(),
          createdAt: new Date(),
          isArchived: false,
        })
      }
      const redirectPath =
        typeof router.query.redirect === 'string'
          ? router.query.redirect
          : '/dashboard'
      router.replace(redirectPath)
    } catch (error: unknown) {
      console.error('Login failed:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed'
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const register = async (
    email: string,
    username: string,
    password: string,
    note?: string
  ): Promise<void> => {
    try {
      setLoading(true)
      const registerData: RegisterDto = {
        email,
        password,
        username: username || undefined,
        note: note || undefined,
      }
      const response: AuthResponseDto = await authApi.register(registerData)
      tokenManager.setToken(response.token)
      try {
        const userData = await userApi.getByEmail(email)
        setUser(userData)
      } catch {
        setUser({
          email,
          username: username || null,
          role: 'USER',
          note: note || null,
          updatedAt: new Date(),
          createdAt: new Date(),
          isArchived: false,
        })
      }
      router.replace('/dashboard')
    } catch (error: unknown) {
      console.error('Registration failed:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed'
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = (): void => {
    tokenManager.removeToken()
    setUser(null)
    router.push('/auth/login')
  }

  const updateUser = async (data: {
    username?: string
    note?: string
  }): Promise<void> => {
    if (!user) throw new Error('No user logged in')
    try {
      const updateData: UpdateUserDto = {
        username: data.username,
        note: data.note,
      }
      const updatedUser = await userApi.update(user.email, updateData)
      setUser(updatedUser)
    } catch (error: unknown) {
      console.error('User update failed:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Update failed'
      throw new Error(errorMessage)
    }
  }

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    if (!user) throw new Error('No user logged in')
    try {
      const updateData: UpdateUserDto = {
        password: newPassword,
      }
      await userApi.update(user.email, updateData)
    } catch (error: unknown) {
      console.error('Password change failed:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Password change failed'
      throw new Error(errorMessage)
    }
  }
  const isAuthenticated = !!user && !!tokenManager.getToken()
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated,
        updateUser,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
