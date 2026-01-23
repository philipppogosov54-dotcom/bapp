'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api/client'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setError('Введите корректный email')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await api.post<{ codeId: string }>('/auth/forgot-password', { email })
      
      // Redirect to reset password page with params
      router.push(`/reset-password?email=${encodeURIComponent(email)}&codeId=${result.codeId}`)
    } catch (err: any) {
      // Don't reveal if email exists
      router.push(`/reset-password?email=${encodeURIComponent(email)}&codeId=pending`)
    } finally {
      setIsLoading(false)
    }
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
            🔑
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1714', marginBottom: '8px' }}>
            Забыли пароль?
          </h1>
          <p style={{ color: '#6B6259', fontSize: '0.9375rem' }}>
            Введите email, и мы отправим код для сброса пароля
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
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <Input
              type="email"
              label="Email"
              placeholder="ivan@example.ru"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            style={{ width: '100%' }}
            loading={isLoading}
            disabled={isLoading || !email}
          >
            Отправить код
          </Button>
        </form>

        {/* Back link */}
        <p style={{ marginTop: '24px', textAlign: 'center' }}>
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
