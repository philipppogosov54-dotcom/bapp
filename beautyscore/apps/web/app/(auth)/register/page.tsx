'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { useAuth } from '@/contexts/auth-context'
import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { getPostAuthRedirect } from '@/lib/utils/auth-redirect'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [justRegistered, setJustRegistered] = useState(false)
  const { register: registerUser, isLoading, isAuthenticated, user } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false as unknown as true, // Type hack for zod literal
    },
  })

  const acceptTermsValue = watch('acceptTerms')

  // Redirect if already authenticated or just registered
  useEffect(() => {
    if (isAuthenticated && user) {
      if (justRegistered) {
        // New user who just registered - always go to onboarding
        router.push('/onboarding/welcome')
      } else {
        // Returning user who's already logged in - check onboarding status
        const redirectPath = getPostAuthRedirect(user, false)
        router.push(redirectPath)
      }
    }
  }, [isAuthenticated, user, justRegistered, router])

  const onSubmit = async (data: RegisterInput) => {
    setError(null)
    const result = await registerUser(data.email, data.password, data.name)
    
    if (result.success) {
      // Mark as just registered - useEffect will handle redirect
      setJustRegistered(true)
    } else {
      setError(result.error || 'Ошибка регистрации')
    }
  }

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1A1714', marginBottom: '8px' }}>
          Создайте аккаунт
        </h1>
        <p style={{ color: '#6B6259' }}>
          Присоединяйтесь к сообществу осознанных пользователей
        </p>
      </div>

      {/* OAuth кнопки */}
      <div style={{ marginBottom: '24px' }}>
        <OAuthButtons isRegister={true} />
      </div>

      {/* Разделитель */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#EDE9E4' }} />
        <span style={{ color: '#8C8177', fontSize: '0.875rem' }}>или email</span>
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
            type="text"
            label="Имя (необязательно)"
            placeholder="Иван"
            {...register('name')}
          />
        </div>

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
            placeholder="Минимум 8 символов"
            error={errors.password?.message}
            {...register('password')}
          />
          <p style={{ color: '#8C8177', fontSize: '0.75rem', marginTop: '4px' }}>
            Заглавная + строчная буква, цифра, спецсимвол (@$!%*?&)
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Input
            type="password"
            label="Подтвердите пароль"
            placeholder="Повторите пароль"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        {/* Consent Checkbox - 152-ФЗ Compliance */}
        <div style={{ marginBottom: '24px' }}>
          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value === true}
                onChange={(e) => field.onChange(e.target.checked)}
                error={errors.acceptTerms?.message}
                label={
                  <>
                    Я принимаю{' '}
                    <Link 
                      href="/terms" 
                      style={{ color: '#2D7A4F', textDecoration: 'none' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Условия использования
                    </Link>{' '}
                    и{' '}
                    <Link 
                      href="/privacy" 
                      style={{ color: '#2D7A4F', textDecoration: 'none' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Политику конфиденциальности
                    </Link>
                    , а также даю согласие на обработку персональных данных
                  </>
                }
              />
            )}
          />
        </div>

        <Button 
          type="submit" 
          size="lg" 
          style={{ width: '100%' }}
          loading={isLoading}
          disabled={isLoading || !acceptTermsValue}
        >
          Создать аккаунт
        </Button>
      </form>

      <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: '#6B6259' }}>
        Уже есть аккаунт?{' '}
        <Link href="/login" style={{ color: '#2D7A4F', textDecoration: 'none', fontWeight: 500 }}>
          Войти
        </Link>
      </p>
    </>
  )
}
