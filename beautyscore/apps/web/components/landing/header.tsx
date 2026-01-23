'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts'
import { Avatar } from '@/components/ui/avatar'

const navItems = [
  { label: 'Возможности', href: '#features' },
  { label: 'Как это работает', href: '#how-it-works' },
  { label: 'Демо', href: '/demo' },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const handleLogout = async () => {
    setIsMenuOpen(false)
    await logout()
  }

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: 'rgba(253, 252, 251, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(237, 233, 228, 0.5)',
        }}
      >
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}>
            <span style={{ fontSize: '1.5rem' }}>🔬</span>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#1A1714',
            }}>
              Beauty<span style={{ color: '#2D7A4F' }}>Score</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isDesktop && (
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
            }}>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    color: '#6B6259',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Desktop Auth buttons / User Menu */}
          {isDesktop && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              {isLoading ? (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#EDE9E4',
                }} />
              ) : isAuthenticated && user ? (
                <>
                  <Link
                    href="/app"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 16px',
                      backgroundColor: '#F7F5F3',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <Avatar
                      src={user.avatar}
                      alt={user.name || 'User'}
                      fallback={user.name?.[0] || user.email?.[0] || 'U'}
                      size="sm"
                    />
                    <span style={{
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      color: '#1A1714',
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {user.name || user.email?.split('@')[0] || 'Пользователь'}
                    </span>
                  </Link>
                  <Link href="/app" style={{
                    padding: '10px 24px',
                    backgroundColor: '#2D7A4F',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 12px rgba(45, 122, 79, 0.25)',
                    transition: 'all 0.2s',
                  }}>
                    Перейти в приложение
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" style={{
                    padding: '10px 20px',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    color: '#1A1714',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}>
                    Войти
                  </Link>
                  <Link href="/register" style={{
                    padding: '10px 24px',
                    backgroundColor: '#2D7A4F',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 12px rgba(45, 122, 79, 0.25)',
                    transition: 'all 0.2s',
                  }}>
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          {!isDesktop && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#1A1714',
              }}
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(26, 23, 20, 0.5)',
              zIndex: 90,
            }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMenuOpen && !isDesktop && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '80%',
              maxWidth: '320px',
              backgroundColor: '#FDFCFB',
              zIndex: 95,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
            }}
          >
            {/* Mobile Menu Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #EDE9E4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#1A1714',
              }}>
                Меню
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F7F5F3',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: '#1A1714',
                }}
                aria-label="Закрыть меню"
              >
                <X size={20} />
              </button>
            </div>

            {/* User info (if authenticated) */}
            {isAuthenticated && user && (
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid #EDE9E4',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <Avatar
                  src={user.avatar}
                  alt={user.name || 'User'}
                  fallback={user.name?.[0] || user.email?.[0] || 'U'}
                  size="lg"
                />
                <div>
                  <p style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#1A1714',
                    margin: 0,
                  }}>
                    {user.name || 'Пользователь'}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6B6259',
                    margin: 0,
                  }}>
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {/* Mobile Navigation */}
            <nav style={{
              flex: 1,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '16px',
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: '#1A1714',
                      textDecoration: 'none',
                      backgroundColor: '#F7F5F3',
                      borderRadius: '12px',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Mobile Auth Buttons / User Actions */}
            <div style={{
              padding: '24px',
              borderTop: '1px solid #EDE9E4',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/app"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '14px',
                      textAlign: 'center',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'white',
                      textDecoration: 'none',
                      backgroundColor: '#2D7A4F',
                      borderRadius: '12px',
                    }}
                  >
                    <User size={18} />
                    Перейти в приложение
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '14px',
                      width: '100%',
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: '#DC2626',
                      backgroundColor: '#FEE2E2',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut size={18} />
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '14px',
                      textAlign: 'center',
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: '#1A1714',
                      textDecoration: 'none',
                      backgroundColor: '#F7F5F3',
                      borderRadius: '12px',
                    }}
                  >
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '14px',
                      textAlign: 'center',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'white',
                      textDecoration: 'none',
                      backgroundColor: '#2D7A4F',
                      borderRadius: '12px',
                    }}
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
