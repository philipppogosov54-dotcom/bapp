'use client'

import { useEffect, useState } from 'react'
import { colors } from '@/lib/design-system'

interface UpdatePromptProps {
  onUpdate: () => void
  onDismiss: () => void
}

function UpdatePrompt({ onUpdate, onDismiss }: UpdatePromptProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: colors.bgPrimary,
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        zIndex: 9999,
        maxWidth: 'calc(100vw - 32px)',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          fontWeight: 500,
          color: colors.textPrimary,
          marginBottom: '4px',
        }}>
          Доступна новая версия
        </p>
        <p style={{
          margin: 0,
          fontSize: '0.75rem',
          color: colors.textSecondary,
        }}>
          Обновите для улучшенной работы
        </p>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onDismiss}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            color: colors.textSecondary,
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Позже
        </button>
        <button
          onClick={onUpdate}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: `linear-gradient(135deg, ${colors.accentGreen} 0%, #1D5A3A 100%)`,
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Обновить
        </button>
      </div>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

interface InstallPromptProps {
  onInstall: () => void
  onDismiss: () => void
}

function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: colors.bgPrimary,
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        zIndex: 9999,
        maxWidth: 'calc(100vw - 32px)',
        width: '340px',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: `linear-gradient(135deg, ${colors.accentGreen} 0%, #1D5A3A 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
        }}
      >
        ✨
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: 600,
          color: colors.textPrimary,
          marginBottom: '8px',
        }}>
          Добавить BeautyScore на экран
        </p>
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          color: colors.textSecondary,
          lineHeight: 1.5,
        }}>
          Быстрый доступ, работа офлайн и push-уведомления
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
        <button
          onClick={onDismiss}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            backgroundColor: 'transparent',
            color: colors.textSecondary,
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Не сейчас
        </button>
        <button
          onClick={onInstall}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            background: `linear-gradient(135deg, ${colors.accentGreen} 0%, #1D5A3A 100%)`,
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Установить
        </button>
      </div>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function ServiceWorkerRegister() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Skip on server
    if (typeof window === 'undefined') return

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service workers not supported')
      return
    }

    // Check if already installed as PWA
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as unknown as { standalone?: boolean }).standalone === true

    // Register service worker
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        console.log('[PWA] Service Worker registered:', registration.scope)

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available
              setWaitingWorker(newWorker)
              setShowUpdatePrompt(true)
            }
          })
        })

        // Check if there's already a waiting worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting)
          setShowUpdatePrompt(true)
        }
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error)
      }
    }

    registerSW()

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after delay if not installed
      if (!isInstalled) {
        // Check if user dismissed recently (within 7 days)
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (dismissed) {
          const dismissedDate = new Date(dismissed)
          const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
          if (daysSinceDismissed < 7) return
        }
        
        // Show prompt after 30 seconds on site
        setTimeout(() => {
          setShowInstallPrompt(true)
        }, 30000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Handle app installed
    const handleAppInstalled = () => {
      console.log('[PWA] App installed successfully')
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    // Handle controller change (after update)
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    }
    setShowUpdatePrompt(false)
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      console.log('[PWA] Install prompt outcome:', outcome)
      
      if (outcome === 'dismissed') {
        localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
      }
    } catch (error) {
      console.error('[PWA] Install error:', error)
    }

    setShowInstallPrompt(false)
    setDeferredPrompt(null)
  }

  const handleDismissInstall = () => {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
    setShowInstallPrompt(false)
  }

  return (
    <>
      {showUpdatePrompt && (
        <UpdatePrompt
          onUpdate={handleUpdate}
          onDismiss={() => setShowUpdatePrompt(false)}
        />
      )}
      {showInstallPrompt && deferredPrompt && (
        <InstallPrompt
          onInstall={handleInstall}
          onDismiss={handleDismissInstall}
        />
      )}
    </>
  )
}

/**
 * Hook to check if app is running as installed PWA
 */
export function useIsPWA(): boolean {
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true
      setIsPWA(isStandalone || isIOSStandalone)
    }

    checkPWA()

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener('change', checkPWA)

    return () => mediaQuery.removeEventListener('change', checkPWA)
  }, [])

  return isPWA
}

/**
 * Hook to check if app is online
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
