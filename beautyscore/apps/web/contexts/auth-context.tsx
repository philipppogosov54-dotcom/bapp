'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api, setAccessToken, clearAccessToken, User, authResponseSchema, validateResponse } from '@/lib/api'
import { analytics } from '@/lib/analytics'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  loginWithToken: (accessToken: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check auth status on mount
  const checkAuth = useCallback(async () => {
    try {
      // Try to refresh token and get user data
      const refreshData = await api.post<{ accessToken: string }>('/auth/refresh')
      
      if (refreshData.accessToken) {
        setAccessToken(refreshData.accessToken)
        
        // Get user data
        const userData = await api.get<User>('/user/profile')
        setUser(userData)
      }
    } catch {
      // Not authenticated, clear state
      clearAccessToken()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    analytics.loginStart('email')
    try {
      const data = await api.post<{ user: User; accessToken: string }>(
        '/auth/login',
        { email, password },
        { skipAuth: true }
      )

      // Validate response
      const validated = validateResponse(authResponseSchema, data)
      if (!validated.success) {
        analytics.loginFailed('email', 'invalid_response')
        return { success: false, error: 'Некорректный ответ от сервера' }
      }

      setAccessToken(validated.data.accessToken)
      setUser(validated.data.user)
      analytics.loginSuccess('email', validated.data.user.id)
      analytics.identify({
        id: validated.data.user.id,
        email: validated.data.user.email,
        name: validated.data.user.name || undefined,
        onboardingCompleted: validated.data.user.onboardingCompleted,
      })
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка входа'
      analytics.loginFailed('email', message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name?: string) => {
    setIsLoading(true)
    analytics.registerStart()
    try {
      const data = await api.post<{ user: User; accessToken: string }>(
        '/auth/register',
        { email, password, name },
        { skipAuth: true }
      )

      // Validate response
      const validated = validateResponse(authResponseSchema, data)
      if (!validated.success) {
        analytics.registerFailed('invalid_response')
        return { success: false, error: 'Некорректный ответ от сервера' }
      }

      setAccessToken(validated.data.accessToken)
      setUser(validated.data.user)
      analytics.registerSuccess(validated.data.user.id)
      analytics.identify({
        id: validated.data.user.id,
        email: validated.data.user.email,
        name: validated.data.user.name || undefined,
        onboardingCompleted: validated.data.user.onboardingCompleted,
      })
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка регистрации'
      analytics.registerFailed(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore errors on logout
    } finally {
      analytics.logout()
      clearAccessToken()
      setUser(null)
      router.push('/login')
    }
  }

  const refreshUser = async () => {
    try {
      const userData = await api.get<User>('/user/profile')
      setUser(userData)
    } catch {
      // Ignore refresh errors
    }
  }

  // Login with access token (for OAuth callbacks)
  const loginWithToken = async (accessToken: string) => {
    try {
      // Set token first
      setAccessToken(accessToken)
      
      // Get user data with the new token
      const userData = await api.get<User>('/user/profile')
      setUser(userData)
      analytics.loginSuccess('oauth', userData.id)
      analytics.identify({
        id: userData.id,
        email: userData.email,
        name: userData.name || undefined,
        onboardingCompleted: userData.onboardingCompleted,
      })
      return { success: true }
    } catch (err) {
      clearAccessToken()
      const message = err instanceof Error ? err.message : 'Ошибка авторизации'
      analytics.loginFailed('oauth', message)
      return { success: false, error: message }
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithToken,
    logout,
    refreshUser,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
