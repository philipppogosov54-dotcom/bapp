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

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Dashboard Error:', error)
    
    // TODO: Send to error tracking service (Sentry)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error)
    // }
  }, [error])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: colors.errorBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <AlertTriangle size={40} style={{ color: colors.errorRed }} />
      </div>
      
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        color: colors.textPrimary,
        marginBottom: '8px',
      }}>
        Что-то пошло не так
      </h1>
      
      <p style={{
        fontSize: '0.9375rem',
        color: colors.textSecondary,
        marginBottom: '24px',
        maxWidth: '400px',
        lineHeight: 1.6,
      }}>
        Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться на главную.
      </p>

      {/* Error details in development */}
      {process.env.NODE_ENV === 'development' && error.message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: colors.bgSecondary,
          marginBottom: '24px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'left',
        }}>
          <p style={{
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: colors.errorRed,
            margin: 0,
            wordBreak: 'break-word',
          }}>
            {error.message}
          </p>
          {error.digest && (
            <p style={{
              fontSize: '0.625rem',
              color: colors.textSecondary,
              margin: '8px 0 0 0',
            }}>
              Error ID: {error.digest}
            </p>
          )}
        </div>
      )}

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
            padding: '12px 24px',
            borderRadius: '12px',
            backgroundColor: colors.accentGreen,
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9375rem',
          }}
        >
          <RefreshCw size={18} />
          Попробовать снова
        </button>
        
        <Link
          href="/app"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '12px',
            backgroundColor: colors.bgSecondary,
            color: colors.textPrimary,
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.9375rem',
          }}
        >
          <Home size={18} />
          На главную
        </Link>
      </div>
    </div>
  )
}
