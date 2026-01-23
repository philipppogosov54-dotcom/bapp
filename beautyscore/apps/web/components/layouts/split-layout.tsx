'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ReactNode, useState, useEffect } from 'react'

interface SplitLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  icon?: string
  features?: Array<{ emoji: string; text: string }>
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

const maxWidthValues = {
  sm: '384px',
  md: '448px',
  lg: '512px',
  xl: '576px',
}

export function SplitLayout({
  children,
  title = 'Добро пожаловать!',
  subtitle = 'Узнайте правду о своей косметике',
  icon = '✨',
  features = [
    { emoji: '🔍', text: 'Мгновенный анализ состава' },
    { emoji: '📊', text: 'Персональные рекомендации' },
    { emoji: '📚', text: 'База 500+ ингредиентов' },
  ],
  maxWidth = 'md',
}: SplitLayoutProps) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: isDesktop ? 'row' : 'column',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Mobile background gradient */}
      {!isDesktop && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `
              linear-gradient(180deg, #FDFCFB 0%, #FDFCFB 60%, rgba(45, 122, 79, 0.03) 100%),
              radial-gradient(ellipse at 100% 0%, rgba(45, 122, 79, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 0% 100%, rgba(196, 128, 77, 0.05) 0%, transparent 50%)
            `,
          }}
        />
      )}

      {/* Left Panel - Form */}
      <div style={{
        width: isDesktop ? '50%' : '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 10,
        backgroundColor: isDesktop ? '#FDFCFB' : 'transparent',
      }}>
        {/* Header with logo */}
        <header style={{
          padding: isDesktop ? '24px' : '20px',
          borderBottom: isDesktop ? 'none' : '1px solid rgba(237, 233, 228, 0.5)',
        }}>
          <Link 
            href="/" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
            }}
          >
            <span style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#E8F5EC',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
            }}>
              🧴
            </span>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#1A1714',
            }}>
              Beauty<span style={{ color: '#2D7A4F' }}>Score</span>
            </span>
          </Link>
        </header>

        {/* Form Container */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isDesktop ? '48px' : '24px',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              width: '100%',
              maxWidth: maxWidthValues[maxWidth],
            }}
          >
            {children}
          </motion.div>
        </div>

        {/* Mobile footer spacer */}
        {!isDesktop && (
          <div style={{ height: '40px' }} />
        )}
      </div>

      {/* Right Panel - Decorative (Desktop only) */}
      {isDesktop && (
        <div style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          background: 'linear-gradient(135deg, #1A1714 0%, #2A2520 50%, #1A1714 100%)',
        }}>
          {/* Background glow effects */}
          <div style={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(45, 122, 79, 0.2) 0%, transparent 60%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(196, 128, 77, 0.15) 0%, transparent 60%)',
            borderRadius: '50%',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }} />

          {/* Grid pattern */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }} />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              textAlign: 'center',
              position: 'relative',
              zIndex: 10,
              maxWidth: '400px',
            }}
          >
            {/* Floating icon */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '96px',
                height: '96px',
                margin: '0 auto 32px',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                backgroundColor: 'rgba(45, 122, 79, 0.15)',
                border: '1px solid rgba(45, 122, 79, 0.3)',
              }}
            >
              {icon}
            </motion.div>

            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: 700,
              color: 'white',
              marginBottom: '16px',
              lineHeight: 1.3,
            }}>
              {title}
            </h2>

            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1.6,
              marginBottom: '40px',
            }}>
              {subtitle}
            </p>

            {/* Features */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              textAlign: 'left',
            }}>
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{feature.emoji}</span>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
