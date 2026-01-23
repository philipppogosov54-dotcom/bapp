'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface OAuthButtonsProps {
  isRegister?: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const TELEGRAM_BOT_USERNAME = 'beautydsoifmsdklbot'

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void
  }
}

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

// VK Icon
const VKIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.523-2.049-1.712-1.033-1.003-1.49-1.138-1.744-1.138-.356 0-.458.102-.458.593v1.561c0 .424-.135.678-1.254.678-1.846 0-3.896-1.12-5.335-3.202-2.164-3.054-2.754-5.335-2.754-5.812 0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.862 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.288-.695-1.712 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.814-.543 1.254-1.406 2.15-3.574 2.15-3.574.119-.254.305-.491.745-.491h1.744c.525 0 .643.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.474-.085.728-.576.728z"/>
  </svg>
)

// Yandex Icon
const YandexIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M2.04 12c0-5.523 4.476-10 10-10 5.522 0 10 4.477 10 10s-4.478 10-10 10c-5.524 0-10-4.477-10-10zm10.882 5.615V8.07h-1.22v-.001c-.947 0-1.546.228-2.029.73-.46.48-.662 1.15-.662 2.2 0 1.035.315 1.696.826 2.26l-2.07 4.355h1.51l1.791-3.89c.14.014.295.014.459.014.24 0 .457-.007.625-.028v3.903h.77zm-.77-4.756h-.24c-.67 0-1.046-.114-1.3-.39-.252-.275-.4-.72-.4-1.48 0-.773.114-1.207.366-1.46.252-.253.628-.38 1.199-.38h.375v3.71z"/>
  </svg>
)

// Telegram Icon
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

// Phone Icon
const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const LoadingSpinner = () => (
  <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
)

export function OAuthButtons({ isRegister = false }: OAuthButtonsProps) {
  const router = useRouter()
  const { loginWithToken } = useAuth()
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const [isLocalhost, setIsLocalhost] = useState(false)

  // Check if we're on localhost (client-side only)
  useEffect(() => {
    setIsLocalhost(
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1'
    )
  }, [])

  // Handle Telegram auth callback
  const handleTelegramAuth = useCallback(async (user: TelegramUser) => {
    setLoadingProvider('telegram')
    try {
      const response = await fetch(`${API_URL}/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(user),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Telegram authentication failed')
      }

      const data = await response.json()
      
      if (data.accessToken) {
        const result = await loginWithToken(data.accessToken)
        if (!result.success) {
          throw new Error(result.error || 'Failed to login')
        }
      }
      
      if (data.user?.onboardingCompleted) {
        router.push('/app')
      } else {
        router.push('/onboarding/welcome')
      }
    } catch (error) {
      console.error('Telegram auth error:', error)
      alert('Ошибка авторизации через Telegram: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'))
    } finally {
      setLoadingProvider(null)
    }
  }, [loginWithToken, router])

  // Set global Telegram callback
  useEffect(() => {
    window.onTelegramAuth = handleTelegramAuth
    return () => {
      delete window.onTelegramAuth
    }
  }, [handleTelegramAuth])

  // Simple redirect to VK OAuth
  const handleVKClick = () => {
    setLoadingProvider('vk')
    window.location.href = `${API_URL}/auth/vk`
  }

  const handleYandexClick = () => {
    setLoadingProvider('yandex')
    window.location.href = `${API_URL}/auth/yandex`
  }

  const handleTelegramClick = () => {
    if (isLocalhost) {
      alert('Telegram Login Widget не работает на localhost.\n\nДля тестирования Telegram авторизации необходимо:\n1. Развернуть приложение на сервере с реальным доменом\n2. Настроить домен в BotFather командой /setdomain')
      return
    }

    setLoadingProvider('telegram')
    
    const width = 550
    const height = 470
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      'about:blank',
      'Telegram Login',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=no`
    )

    if (popup) {
      popup.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Telegram Login</title>
          <style>
            body { display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
            .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h2 { margin: 0 0 20px; color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Войти через Telegram</h2>
            <script async src="https://telegram.org/js/telegram-widget.js?22" 
                    data-telegram-login="${TELEGRAM_BOT_USERNAME}" 
                    data-size="large" 
                    data-onauth="onTelegramAuth(user)" 
                    data-request-access="write"></script>
          </div>
          <script>
            function onTelegramAuth(user) {
              window.opener.postMessage({ type: 'telegram_auth', user: user }, '${window.location.origin}');
              window.close();
            }
          </script>
        </body>
        </html>
      `)
      popup.document.close()
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data?.type === 'telegram_auth') {
        handleTelegramAuth(event.data.user)
        setLoadingProvider(null)
      }
    }

    window.addEventListener('message', handleMessage)
    
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        window.removeEventListener('message', handleMessage)
        setLoadingProvider(null)
      }
    }, 500)
  }

  const handlePhoneLogin = () => {
    router.push('/phone-login')
  }

  // Common button styles
  const buttonStyle = {
    width: '100%',
    height: '52px',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s ease',
  }

  const isDisabled = loadingProvider !== null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* VK Button */}
      <button
        onClick={handleVKClick}
        disabled={isDisabled}
        style={{
          ...buttonStyle,
          backgroundColor: '#0077FF',
          color: 'white',
          opacity: isDisabled ? 0.7 : 1,
        }}
      >
        {loadingProvider === 'vk' ? <LoadingSpinner /> : <VKIcon />}
        <span>{isRegister ? 'Регистрация через' : 'Войти с'} VK ID</span>
      </button>

      {/* Yandex Button */}
      <button
        onClick={handleYandexClick}
        disabled={isDisabled}
        style={{
          ...buttonStyle,
          backgroundColor: '#FC3F1D',
          color: 'white',
          opacity: isDisabled ? 0.7 : 1,
        }}
      >
        {loadingProvider === 'yandex' ? <LoadingSpinner /> : <YandexIcon />}
        <span>{isRegister ? 'Регистрация через' : 'Войти через'} Яндекс ID</span>
      </button>

      {/* Telegram Button */}
      <button
        onClick={handleTelegramClick}
        disabled={isDisabled}
        style={{
          ...buttonStyle,
          backgroundColor: '#0088CC',
          color: 'white',
          opacity: isDisabled || isLocalhost ? 0.6 : 1,
        }}
        title={isLocalhost ? 'Недоступно на localhost' : undefined}
      >
        {loadingProvider === 'telegram' ? <LoadingSpinner /> : <TelegramIcon />}
        <span>{isRegister ? 'Регистрация через' : 'Войти через'} Telegram</span>
      </button>

      {/* Phone Button */}
      <button
        onClick={handlePhoneLogin}
        disabled={isDisabled}
        style={{
          ...buttonStyle,
          backgroundColor: '#F7F5F3',
          color: '#1A1714',
          opacity: isDisabled ? 0.7 : 1,
        }}
      >
        <PhoneIcon />
        <span>{isRegister ? 'Регистрация по' : 'Войти по'} телефону</span>
      </button>
    </div>
  )
}
