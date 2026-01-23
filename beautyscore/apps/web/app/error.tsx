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

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global Error:', error)
  }, [error])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      textAlign: 'center',
      backgroundColor: colors.bgPrimary,
    }}>
      <div style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: colors.errorBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '32px',
      }}>
        <AlertTriangle size={48} style={{ color: colors.errorRed }} />
      </div>
      
      <h1 style={{
        fontSize: '1.75rem',
        fontWeight: 600,
        color: colors.textPrimary,
        marginBottom: '12px',
      }}>
        Произошла ошибка
      </h1>
      
      <p style={{
        fontSize: '1rem',
        color: colors.textSecondary,
        marginBottom: '32px',
        maxWidth: '450px',
        lineHeight: 1.6,
      }}>
        Что-то пошло не так. Мы уже работаем над исправлением. Попробуйте обновить страницу.
      </p>

      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <button
          onClick={reset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 28px',
            borderRadius: '14px',
            backgroundColor: colors.accentGreen,
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          <RefreshCw size={20} />
          Обновить страницу
        </button>
        
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 28px',
            borderRadius: '14px',
            backgroundColor: colors.bgSecondary,
            color: colors.textPrimary,
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '1rem',
          }}
        >
          <Home size={20} />
          Вернуться на главную
        </Link>
      </div>
    </div>
  )
}
