'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api/client'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const type = searchParams.get('type') || 'email' // email or phone
  const target = searchParams.get('target') || ''
  const codeIdParam = searchParams.get('codeId') || ''
  
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [codeId, setCodeId] = useState(codeIdParam)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only digits

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Only last digit
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when complete
    if (newCode.every(d => d !== '') && newCode.join('').length === 6) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = pastedData.split('')
    while (newCode.length < 6) newCode.push('')
    setCode(newCode)
    
    if (pastedData.length === 6) {
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (verifyCode: string) => {
    if (!codeId) {
      setError('Код не найден. Запросите новый код.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (type === 'email') {
        await api.post('/auth/verify-email', { codeId, code: verifyCode })
      } else {
        await api.post('/auth/sms/verify', { codeId, code: verifyCode })
      }
      
      // Success - redirect
      router.push('/onboarding/welcome')
    } catch (err: any) {
      setError(err.message || 'Неверный код')
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || isResending) return
    
    setIsResending(true)
    setError(null)

    try {
      const result = await api.post<{ codeId: string; message: string }>('/auth/resend-code', {
        type: type === 'email' ? 'email' : 'phone',
        target,
      })
      
      setCodeId(result.codeId)
      setCountdown(60) // 60 seconds cooldown
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err: any) {
      setError(err.message || 'Ошибка отправки')
    } finally {
      setIsResending(false)
    }
  }

  const maskedTarget = type === 'email' 
    ? target.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : target.replace(/(\+7)(\d{3})(\d*)(\d{2})/, '$1 $2 *** ** $4')

  return (
    <>
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
          {type === 'email' ? '✉️' : '📱'}
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1714', marginBottom: '8px' }}>
          Подтвердите {type === 'email' ? 'email' : 'телефон'}
        </h1>
        <p style={{ color: '#6B6259', fontSize: '0.9375rem' }}>
          Мы отправили код на<br />
          <strong style={{ color: '#1A1714' }}>{maskedTarget}</strong>
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
            onPaste={handlePaste}
            disabled={isLoading}
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
            onFocus={e => {
              e.target.style.borderColor = '#2D7A4F'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'transparent'
            }}
          />
        ))}
      </div>

      {/* Verify button */}
      <Button
        onClick={() => handleVerify(code.join(''))}
        size="lg"
        style={{ width: '100%' }}
        loading={isLoading}
        disabled={isLoading || code.some(d => d === '')}
      >
        Подтвердить
      </Button>

      {/* Resend */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: '#6B6259', marginBottom: '8px' }}>
          Не получили код?
        </p>
        <button
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          style={{
            background: 'none',
            border: 'none',
            color: countdown > 0 ? '#8C8177' : '#2D7A4F',
            fontSize: '0.9375rem',
            fontWeight: 500,
            cursor: countdown > 0 ? 'default' : 'pointer',
          }}
        >
          {countdown > 0 
            ? `Отправить повторно (${countdown}с)` 
            : isResending 
              ? 'Отправляем...' 
              : 'Отправить повторно'}
        </button>
      </div>

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
    </>
  )
}
