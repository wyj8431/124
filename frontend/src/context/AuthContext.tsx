import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { authApi } from '@/api'
import type { UserInfo } from '@/types'

interface AuthContextValue {
  user: UserInfo | null
  token: string | null
  isLoggedIn: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  registerByPhone: (data: {
    phone: string
    smsCode: string
    password: string
    confirmPassword: string
  }) => Promise<void>
  resetPassword: (data: {
    phone: string
    smsCode: string
    password: string
    confirmPassword: string
  }) => Promise<void>
  logout: () => void
  showLoginModal: boolean
  setShowLoginModal: (v: boolean) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ckt_token'))
  const [showLoginModal, setShowLoginModal] = useState(false)

  const persist = useCallback((t: string, u: UserInfo) => {
    localStorage.setItem('ckt_token', t)
    setToken(t)
    setUser(u)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login(username, password)
    persist(res.token, res.user)
    setShowLoginModal(false)
  }, [persist])

  const register = useCallback(async (username: string, password: string) => {
    const res = await authApi.register(username, password)
    persist(res.token, res.user)
    setShowLoginModal(false)
  }, [persist])

  const registerByPhone = useCallback(async (data: {
    phone: string
    smsCode: string
    password: string
    confirmPassword: string
  }) => {
    const res = await authApi.registerByPhone(data)
    persist(res.token, res.user)
    setShowLoginModal(false)
  }, [persist])

  const resetPassword = useCallback(async (data: {
    phone: string
    smsCode: string
    password: string
    confirmPassword: string
  }) => {
    const res = await authApi.resetPassword(data)
    persist(res.token, res.user)
    setShowLoginModal(false)
  }, [persist])

  const logout = useCallback(() => {
    localStorage.removeItem('ckt_token')
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (token && !user) {
      authApi.profile().then(setUser).catch(logout)
    }
  }, [token, user, logout])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!token && !!user,
        login,
        register,
        registerByPhone,
        resetPassword,
        logout,
        showLoginModal,
        setShowLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
