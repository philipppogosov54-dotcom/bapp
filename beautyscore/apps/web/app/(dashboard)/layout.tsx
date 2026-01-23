'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { LogOut } from 'lucide-react'

interface NavItem {
  icon: string
  label: string
  href: string
}

const navItems: NavItem[] = [
  { icon: '🔍', label: 'Поиск', href: '/app' },
  { icon: '📦', label: 'Полка', href: '/app/shelf' },
  { icon: '📚', label: 'Каталог', href: '/app/encyclopedia' },
  { icon: '⭐', label: 'Тренды', href: '/app/trends' },
  { icon: '👤', label: 'Профиль', href: '/app/profile' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [isDesktop, setIsDesktop] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
  }

  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: '#FDFCFB',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '2rem' }}>🔬</div>
          <div style={{
            width: '32px',
            height: '32px',
            border: '4px solid #EDE9E4',
            borderTopColor: '#2D7A4F',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FDFCFB' }}>
      {/* Sidebar (Desktop only) */}
      {isDesktop && (
        <aside style={{
          width: '260px',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          backgroundColor: '#F7F5F3',
          borderRight: '1px solid #EDE9E4',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 200,
        }}>
          {/* Logo */}
          <div style={{ padding: '24px', borderBottom: '1px solid #EDE9E4' }}>
            <Link href="/app" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <span style={{ fontSize: '1.5rem' }}>🔬</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1A1714' }}>
                Beauty<span style={{ color: '#2D7A4F' }}>Score</span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/app' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: isActive ? 'white' : '#6B6259',
                    backgroundColor: isActive ? '#2D7A4F' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User & Logout */}
          <div style={{ padding: '16px', borderTop: '1px solid #EDE9E4' }}>
            {/* User Info */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '8px',
              marginBottom: '12px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                backgroundColor: '#2D7A4F',
                color: 'white',
                flexShrink: 0,
              }}>
                {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontWeight: 600, 
                  fontSize: '0.875rem', 
                  color: '#1A1714',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {user?.name || 'Пользователь'}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#8C8177',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: '#FEE2E2',
                border: 'none',
                cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                opacity: isLoggingOut ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {isLoggingOut ? (
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid #FCA5A5',
                  borderTopColor: '#DC2626',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
              ) : (
                <LogOut size={18} style={{ color: '#DC2626' }} />
              )}
              <span style={{
                fontWeight: 500,
                fontSize: '0.875rem',
                color: '#DC2626',
              }}>
                {isLoggingOut ? 'Выход...' : 'Выйти'}
              </span>
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Header */}
      {!isDesktop && (
        <header 
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            padding: '16px',
            backgroundColor: '#FDFCFB',
            borderBottom: '1px solid #EDE9E4'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/app" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <span style={{ fontSize: '1.5rem' }}>🔬</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1A1714' }}>
                Beauty<span style={{ color: '#2D7A4F' }}>Score</span>
              </span>
            </Link>
            <Link 
              href="/app/profile"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 600,
                backgroundColor: '#2D7A4F',
                color: 'white',
                textDecoration: 'none'
              }}
            >
              {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Link>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main 
        style={{ 
          flex: 1, 
          minHeight: '100vh',
          marginLeft: isDesktop ? '260px' : 0,
        }}
      >
        <div 
          style={{ 
            maxWidth: '900px', 
            margin: '0 auto', 
            padding: '32px 16px',
            paddingTop: isDesktop ? '32px' : '88px',
            // I-4: Increased padding to prevent bottom nav overlap
            paddingBottom: isDesktop ? '32px' : '120px',
          }}
        >
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {!isDesktop && (
        <nav 
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FDFCFB',
            borderTop: '1px solid #EDE9E4',
            paddingBottom: 'env(safe-area-inset-bottom)',
            zIndex: 200,
            display: 'flex',
          }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/app' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '12px',
                  color: isActive ? '#2D7A4F' : '#8C8177',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  transition: 'color 0.15s',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}
