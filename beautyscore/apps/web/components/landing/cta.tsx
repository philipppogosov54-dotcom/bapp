'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Sparkles, Zap } from 'lucide-react'

const features = [
  { icon: Sparkles, text: 'Бесплатно' },
  { icon: Shield, text: 'Без рекламы' },
  { icon: Zap, text: 'Мгновенный анализ' },
]

export function CTA() {
  return (
    <section style={{
      padding: '60px 16px',
      background: 'linear-gradient(135deg, #1A1714 0%, #2A2520 50%, #1A1714 100%)',
      position: 'relative',
      overflow: 'hidden',
    }} className="md:py-[80px] lg:py-[100px] md:px-6">
      {/* Background decorations */}
      <div className="hidden md:block" style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(45, 122, 79, 0.15) 0%, transparent 60%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />
      <div className="hidden md:block" style={{
        position: 'absolute',
        bottom: '-30%',
        left: '-10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(196, 128, 77, 0.1) 0%, transparent 60%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: 'rgba(45, 122, 79, 0.2)',
            borderRadius: '100px',
            marginBottom: '24px',
            border: '1px solid rgba(45, 122, 79, 0.3)',
          }} className="md:mb-8 md:py-3 md:px-6">
            <span style={{ fontSize: '1rem' }}>🔬</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6DD9A0' }}>
              Готовы начать?
          </span>
          </div>

        {/* Heading */}
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 3rem)',
            fontWeight: 700,
            color: 'white',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }} className="md:mb-6">
            Узнай состав своей косметики{' '}
            <span style={{ color: '#6DD9A0' }}>прямо сейчас</span>
          </h2>

        {/* Description */}
          <p style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.125rem)',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '32px',
            lineHeight: 1.7,
            maxWidth: '520px',
            margin: '0 auto',
            padding: '0 8px 32px',
          }} className="md:pb-10 lg:pb-12">
            Присоединяйся к тысячам пользователей, которые уже делают осознанный выбор. 
            Регистрация бесплатная и занимает меньше минуты.
          </p>

          {/* CTA Button */}
        <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            style={{ display: 'inline-block' }}
        >
          <Link href="/register" style={{
            display: 'inline-flex',
            alignItems: 'center',
              gap: '12px',
              padding: '16px 32px',
            backgroundColor: '#2D7A4F',
            color: 'white',
            borderRadius: '16px',
            fontSize: '1.0625rem',
            fontWeight: 600,
            textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(45, 122, 79, 0.4), 0 0 0 1px rgba(45, 122, 79, 0.2)',
              transition: 'all 0.2s',
            }} className="md:py-5 md:px-10 md:text-lg md:gap-3 md:rounded-[20px]">
              Создать бесплатный аккаунт
              <ArrowRight size={20} className="md:w-6 md:h-6" />
          </Link>
        </motion.div>

          {/* Features badges */}
          <div 
            className="flex flex-wrap items-center justify-center gap-3 md:gap-6"
            style={{ marginTop: '32px' }}
        >
            {features.map((feature) => {
              const Icon = feature.icon
              return (
            <div
                  key={feature.text}
              style={{
                display: 'flex',
                alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '100px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
                  className="md:py-3 md:px-5 md:gap-2"
                >
                  <Icon size={14} style={{ color: '#6DD9A0' }} className="md:w-4 md:h-4" />
                  <span style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.8)' }} className="md:text-sm">
                    {feature.text}
                  </span>
                </div>
              )
            })}
            </div>
        </motion.div>
      </div>
    </section>
  )
}
