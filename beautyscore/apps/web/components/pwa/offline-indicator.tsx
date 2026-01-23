'use client'

import { useEffect, useState } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { colors } from '@/lib/design-system'
import { useOnlineStatus } from './sw-register'

/**
 * Shows an indicator when user is offline
 * Auto-hides when back online
 */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const [wasOffline, setWasOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true)
    } else if (wasOffline) {
      // Show "reconnected" message briefly
      setShowReconnected(true)
      const timer = setTimeout(() => {
        setShowReconnected(false)
        setWasOffline(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  // Don't render anything if online and never was offline
  if (isOnline && !showReconnected) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        zIndex: 10000,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        backgroundColor: showReconnected ? colors.accentGreen : '#EF4444',
        color: 'white',
        fontSize: '0.875rem',
        fontWeight: 500,
        animation: 'slideDown 0.3s ease-out',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      {showReconnected ? (
        <>
          <Wifi size={18} />
          <span>Подключение восстановлено</span>
        </>
      ) : (
        <>
          <WifiOff size={18} />
          <span>Нет подключения к интернету</span>
        </>
      )}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Full-page offline screen for critical flows
 */
export function OfflineScreen({ onRetry }: { onRetry?: () => void }) {
  const isOnline = useOnlineStatus()

  // Auto-retry when back online
  useEffect(() => {
    if (isOnline && onRetry) {
      onRetry()
    }
  }, [isOnline, onRetry])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: `linear-gradient(135deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`,
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${colors.accentGreen} 0%, #1D5A3A 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        <WifiOff size={36} color="white" />
      </div>
      
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        color: colors.textPrimary,
        marginBottom: '12px',
        textAlign: 'center',
      }}>
        Нет подключения
      </h1>
      
      <p style={{
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 1.6,
        maxWidth: '320px',
        marginBottom: '24px',
      }}>
        Проверьте подключение к интернету и попробуйте снова. 
        Мы автоматически восстановим работу при появлении сети.
      </p>
      
      <button
        onClick={onRetry || (() => window.location.reload())}
        style={{
          padding: '14px 28px',
          borderRadius: '12px',
          border: 'none',
          background: `linear-gradient(135deg, ${colors.accentGreen} 0%, #1D5A3A 100%)`,
          color: 'white',
          fontSize: '1rem',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Wifi size={18} />
        Попробовать снова
      </button>
      
      <p style={{
        marginTop: '16px',
        fontSize: '0.875rem',
        color: colors.textTertiary,
      }}>
        Некоторые функции доступны офлайн
      </p>
    </div>
  )
}
