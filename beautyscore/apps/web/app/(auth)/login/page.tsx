'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { useAuth } from '@/contexts/auth-context'
import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getPostAuthRedirect } from '@/lib/utils/auth-redirect'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const { login, isLoading, isAuthenticated, user } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = getPostAuthRedirect(user, false)
      router.push(redirectPath)
    }
  }, [isAuthenticated, user, router])

  const onSubmit = async (data: LoginInput) => {
    setError(null)
    const result = await login(data.email, data.password)

    if (result.success) {
      // Wait a bit for user data to be set, then redirect
      setTimeout(() => {
        const redirectPath = getPostAuthRedirect(user, false)
        router.push(redirectPath)
      }, 100)
    } else {
      setError(result.error || 'Ошибка входа')
    }
  }

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1A1714', marginBottom: '8px' }}>
          Добро пожаловать!
        </h1>
        <p style={{ color: '#6B6259' }}>
          Войдите в аккаунт, чтобы продолжить
        </p>
      </div>

      {/* OAuth кнопки */}
      <div style={{ marginBottom: '24px' }}>
        <OAuthButtons isRegister={false} />
      </div>

      {/* Разделитель */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#EDE9E4' }} />
        <span style={{ color: '#8C8177', fontSize: '0.875rem' }}>или войдите через email</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#EDE9E4' }} />
      </div>

      {/* Форма */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '12px',
            color: '#DC2626',
            fontSize: '0.875rem',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <Input
            type="email"
            label="Email"
            placeholder="ivan@example.ru"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Input
            type="password"
            label="Пароль"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: '#2D7A4F' }} />
            <span style={{ fontSize: '0.875rem', color: '#6B6259' }}>Запомнить меня</span>
          </label>
          <Link href="/forgot-password" style={{
            fontSize: '0.875rem',
            color: '#2D7A4F',
            textDecoration: 'none',
            fontWeight: 500,
          }}>
            Забыли пароль?
          </Link>
        </div>

        <Button 
          type="submit" 
          size="lg" 
          style={{ width: '100%' }}
          loading={isLoading}
          disabled={isLoading}
        >
          Войти
        </Button>
      </form>

      <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: '#6B6259' }}>
        Нет аккаунта?{' '}
        <Link href="/register" style={{ color: '#2D7A4F', textDecoration: 'none', fontWeight: 500 }}>
          Зарегистрироваться
        </Link>
      </p>
    </>
  )
}
