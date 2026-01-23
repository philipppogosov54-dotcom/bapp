'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

// Design system colors
const colors = {
  bgPrimary: '#FDFCFB',
  bgSecondary: '#F7F5F3',
  textPrimary: '#1A1714',
  textSecondary: '#6B6259',
  accentGreen: '#2D7A4F',
  errorRed: '#DC2626',
  errorBg: '#FEE2E2',
}

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Auth Error:', error)
  }, [error])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: colors.errorBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <AlertTriangle size={32} style={{ color: colors.errorRed }} />
      </div>
      
      <h1 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: colors.textPrimary,
        marginBottom: '8px',
      }}>
        Ошибка авторизации
      </h1>
      
      <p style={{
        fontSize: '0.875rem',
        color: colors.textSecondary,
        marginBottom: '24px',
        maxWidth: '320px',
      }}>
        Не удалось выполнить операцию. Попробуйте ещё раз.
      </p>

      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <button
          onClick={reset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '12px',
            backgroundColor: colors.accentGreen,
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          <RefreshCw size={16} />
          Повторить
        </button>
        
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '12px',
            backgroundColor: colors.bgSecondary,
            color: colors.textPrimary,
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          <Home size={16} />
          На главную
        </Link>
      </div>
    </div>
  )
}
