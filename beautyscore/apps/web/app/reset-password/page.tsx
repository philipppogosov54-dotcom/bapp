'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const email = searchParams.get('email') || ''
  const codeIdParam = searchParams.get('codeId') || ''
  
  const [step, setStep] = useState<'code' | 'password'>('code')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [codeId, setCodeId] = useState(codeIdParam)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Focus first input
  useEffect(() => {
    if (step === 'code') {
      inputRefs.current[0]?.focus()
    }
  }, [step])

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyCode = () => {
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('Введите 6-значный код')
      return
    }
    setError(null)
    setStep('password')
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 8) {
      setError('Пароль должен содержать минимум 8 символов')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await api.post('/auth/reset-password', {
        codeId,
        code: code.join(''),
        newPassword,
      })
      
      setSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Ошибка сброса пароля')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    
    setIsLoading(true)
    try {
      const result = await api.post<{ codeId: string }>('/auth/forgot-password', { email })
      setCodeId(result.codeId)
      setCountdown(60)
      setCode(['', '', '', '', '', ''])
      setError(null)
      inputRefs.current[0]?.focus()
    } catch {
      // Silent fail - don't reveal if email exists
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        backgroundColor: '#FDFCFB',
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: '#E8F5EC', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '24px',
          fontSize: '36px',
        }}>
          ✅
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1714', marginBottom: '8px' }}>
          Пароль изменён!
        </h1>
        <p style={{ color: '#6B6259', textAlign: 'center' }}>
          Перенаправляем на страницу входа...
        </p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: '#FDFCFB',
    }}>
      <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: '#E8F5EC', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '28px',
          }}>
            {step === 'code' ? '📧' : '🔒'}
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1714', marginBottom: '8px' }}>
            {step === 'code' ? 'Введите код' : 'Новый пароль'}
          </h1>
          <p style={{ color: '#6B6259', fontSize: '0.9375rem' }}>
            {step === 'code' 
              ? `Код отправлен на ${email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`
              : 'Придумайте надёжный пароль'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '12px',
            color: '#DC2626',
            fontSize: '0.875rem',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {step === 'code' ? (
          <>
            {/* Code inputs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              marginBottom: '24px',
            }}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleInputChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  style={{
                    width: '48px',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: '#1A1714',
                    backgroundColor: '#F7F5F3',
                    border: '2px solid transparent',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#2D7A4F' }}
                  onBlur={e => { e.target.style.borderColor = 'transparent' }}
                />
              ))}
            </div>

            <Button
              onClick={handleVerifyCode}
              size="lg"
              style={{ width: '100%' }}
              disabled={code.some(d => d === '')}
            >
              Продолжить
            </Button>

            {/* Resend */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button
                onClick={handleResend}
                disabled={countdown > 0 || isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: countdown > 0 ? '#8C8177' : '#2D7A4F',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  cursor: countdown > 0 ? 'default' : 'pointer',
                }}
              >
                {countdown > 0 ? `Отправить повторно (${countdown}с)` : 'Отправить код ещё раз'}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '16px' }}>
              <Input
                type="password"
                label="Новый пароль"
                placeholder="Минимум 8 символов"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Input
                type="password"
                label="Подтвердите пароль"
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              style={{ width: '100%' }}
              loading={isLoading}
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              Сохранить новый пароль
            </Button>

            <button
              type="button"
              onClick={() => setStep('code')}
              style={{
                display: 'block',
                width: '100%',
                marginTop: '16px',
                background: 'none',
                border: 'none',
                color: '#6B6259',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              ← Изменить код
            </button>
          </form>
        )}

        {/* Back link */}
        <p style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link href="/login" style={{ 
            color: '#6B6259', 
            textDecoration: 'none', 
            fontSize: '0.875rem' 
          }}>
            ← Вернуться к входу
          </Link>
        </p>
      </div>
    </div>
  )
}
