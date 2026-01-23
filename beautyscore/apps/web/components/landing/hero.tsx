'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Sparkles, Package } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
}

const floatingAnimation = {
  y: [-8, 8, -8],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut" as const
  }
}

export function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FDFCFB 0%, #F7F5F3 50%, #EDE9E4 100%)',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '120px',
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(45, 122, 79, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(196, 128, 77, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '80px',
        alignItems: 'center',
        minHeight: 'calc(100vh - 120px)',
      }}>
        {/* Left: Content */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={fadeInUp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'rgba(45, 122, 79, 0.1)',
              borderRadius: '100px',
              marginBottom: '24px',
            }}
          >
            <Sparkles size={16} style={{ color: '#2D7A4F' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#2D7A4F' }}>
              Бесплатный анализ косметики
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeInUp}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: '#1A1714',
              marginBottom: '24px',
              letterSpacing: '-0.02em',
            }}
          >
            Узнай правду о{' '}
            <span style={{
              background: 'linear-gradient(135deg, #2D7A4F 0%, #1A5C3A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              своей косметике
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: '1.25rem',
              lineHeight: 1.6,
              color: '#6B6259',
              marginBottom: '40px',
              maxWidth: '520px',
            }}
          >
            Сканируй штрих-код или найди по названию. Получи детальный анализ состава, 
            рейтинг безопасности и персональные рекомендации за секунды.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '48px',
            }}
          >
            <Link href="/register" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 32px',
              backgroundColor: '#2D7A4F',
              color: 'white',
              borderRadius: '16px',
              fontSize: '1.0625rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(45, 122, 79, 0.3)',
              transition: 'all 0.2s',
            }}>
              Начать бесплатно
              <ArrowRight size={20} />
            </Link>
            <Link href="/login" style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '16px 32px',
              backgroundColor: 'transparent',
              color: '#1A1714',
              border: '2px solid #EDE9E4',
              borderRadius: '16px',
              fontSize: '1.0625rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              Уже есть аккаунт
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeInUp}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={20} style={{ color: '#2D7A4F' }} />
              <span style={{ fontSize: '0.9375rem', color: '#6B6259' }}>Безопасно</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={20} style={{ color: '#C4804D' }} />
              <span style={{ fontSize: '0.9375rem', color: '#6B6259' }}>50,000+ продуктов</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: iPhone Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* iPhone Frame */}
          <motion.div
            animate={floatingAnimation}
            style={{
              width: '320px',
              height: '650px',
              backgroundColor: '#1A1714',
              borderRadius: '48px',
              padding: '12px',
              boxShadow: '0 50px 100px rgba(26, 23, 20, 0.25), 0 20px 60px rgba(26, 23, 20, 0.15)',
              position: 'relative',
            }}
          >
            {/* Screen */}
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#FDFCFB',
              borderRadius: '38px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {/* Status bar */}
              <div style={{
                padding: '12px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#1A1714',
              }}>
                <span>9:41</span>
                <div style={{
                  width: '80px',
                  height: '28px',
                  backgroundColor: '#1A1714',
                  borderRadius: '20px',
                }} />
                <span>100%</span>
              </div>

              {/* App Header */}
              <div style={{
                padding: '8px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ fontSize: '1.25rem' }}>🔬</span>
                <span style={{ fontWeight: 600, fontSize: '1rem', color: '#1A1714' }}>
                  Beauty<span style={{ color: '#2D7A4F' }}>Score</span>
                </span>
              </div>

              {/* Scanner area */}
              <div style={{
                margin: '16px 20px',
                height: '180px',
                backgroundColor: '#1A1714',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Scan corners */}
                <div style={{
                  position: 'absolute',
                  width: '60%',
                  height: '60%',
                  border: '3px solid #2D7A4F',
                  borderRadius: '8px',
                }} />
                {/* Scan line */}
                <motion.div
                  animate={{ y: [-40, 40, -40] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    width: '55%',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #2D7A4F, transparent)',
                    boxShadow: '0 0 20px #2D7A4F',
                  }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: '16px',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.75rem',
                }}>
                  Наведи камеру на штрих-код
                </span>
              </div>

              {/* Product Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                style={{
                  margin: '12px 20px',
                  padding: '16px',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#2D7A4F',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                }}>
                  82
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1714' }}>
                    CeraVe Увлажняющий крем
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8C8177' }}>
                    Уход за кожей
                  </div>
                </div>
              </motion.div>

              {/* Bottom Navigation */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '20px',
                right: '20px',
                height: '64px',
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '0 16px',
              }}>
                {['🔍', '📦', '📚', '👤'].map((icon, i) => (
                  <div
                    key={i}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      backgroundColor: i === 0 ? 'rgba(45, 122, 79, 0.1)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                    }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            style={{
              position: 'absolute',
              top: '15%',
              right: '-20px',
              padding: '14px 18px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'rgba(45, 122, 79, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2D7A4F',
            }}>
              ✓
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1714' }}>Безопасно</div>
              <div style={{ fontSize: '0.75rem', color: '#8C8177' }}>для чувствительной кожи</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            style={{
              position: 'absolute',
              bottom: '25%',
              left: '-30px',
              padding: '14px 18px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'rgba(196, 128, 77, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#C4804D',
            }}>
              ⚠
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1714' }}>Внимание</div>
              <div style={{ fontSize: '0.75rem', color: '#8C8177' }}>содержит отдушки</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '0.75rem', color: '#8C8177' }}>Прокрути вниз</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            width: '24px',
            height: '40px',
            border: '2px solid #EDE9E4',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '8px',
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              width: '4px',
              height: '8px',
              backgroundColor: '#8C8177',
              borderRadius: '2px',
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
