'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export default function NotFound() {
  const { isAuthenticated, isLoading } = useAuth()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#FDFCFB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '4px solid #EDE9E4',
          borderTopColor: '#2D7A4F',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FDFCFB',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
      }}>
        {/* 404 Number */}
        <div style={{
          fontSize: 'clamp(6rem, 15vw, 10rem)',
          fontWeight: 800,
          color: '#EDE9E4',
          lineHeight: 1,
          marginBottom: '24px',
          letterSpacing: '-0.05em',
        }}>
          404
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 700,
          color: '#1A1714',
          marginBottom: '16px',
          letterSpacing: '-0.02em',
        }}>
          Страница не найдена
        </h1>

        {/* Description */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.125rem)',
          color: '#6B6259',
          lineHeight: 1.7,
          marginBottom: '32px',
        }}>
          К сожалению, запрашиваемая страница не существует. 
          Возможно, она была удалена или вы ввели неправильный адрес.
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isAuthenticated ? (
            // Authenticated user - go to app
            <Link href="/app" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              backgroundColor: '#2D7A4F',
              color: 'white',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center',
            }}>
              <LayoutDashboard size={20} />
              В приложение
            </Link>
          ) : (
            // Guest user - go to landing
            <Link href="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              backgroundColor: '#2D7A4F',
              color: 'white',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center',
            }}>
              <Home size={20} />
              На главную
            </Link>
          )}
          
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              backgroundColor: 'transparent',
              color: '#1A1714',
              border: '2px solid #EDE9E4',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={20} />
            Назад
          </button>
        </div>
      </div>
    </div>
  )
}
