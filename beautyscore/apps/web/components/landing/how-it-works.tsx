'use client'

import { motion } from 'framer-motion'
import { Camera, Search, Check } from 'lucide-react'

const steps = [
  {
    icon: Camera,
    number: '01',
    title: 'Сканируй или найди',
    description: 'Наведи камеру на штрих-код или введи название продукта в поиске.',
    color: '#2D7A4F',
    bgColor: 'rgba(45, 122, 79, 0.08)',
  },
  {
    icon: Search,
    number: '02',
    title: 'Анализируй состав',
    description: 'Получи детальный разбор каждого ингредиента с понятными объяснениями.',
    color: '#4A7C9B',
    bgColor: 'rgba(74, 124, 155, 0.08)',
  },
  {
    icon: Check,
    number: '03',
    title: 'Принимай решение',
    description: 'Используй персональные рекомендации для осознанного выбора косметики.',
    color: '#C4804D',
    bgColor: 'rgba(196, 128, 77, 0.08)',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: '80px 16px',
        background: 'linear-gradient(180deg, #F7F5F3 0%, #FDFCFB 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="md:py-[100px] lg:py-[120px] md:px-6"
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: 'center',
            marginBottom: '48px',
          }}
          className="md:mb-[60px] lg:mb-[80px]"
        >
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 3rem)',
            fontWeight: 700,
            color: '#1A1714',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }} className="md:mb-5">
            Как это работает?
          </h2>
          <p style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.125rem)',
            color: '#6B6259',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: 1.7,
            padding: '0 8px',
          }}>
            Три простых шага к осознанному выбору косметики
          </p>
        </motion.div>

        {/* Steps */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10"
          style={{ position: 'relative' }}
        >
          {/* Connection line - horizontal for desktop, vertical for mobile */}
          <div 
            className="hidden md:block" 
            style={{
            position: 'absolute',
              top: '70px',
              left: '16%',
              right: '16%',
            height: '2px',
              background: 'linear-gradient(90deg, transparent, #EDE9E4 10%, #EDE9E4 90%, transparent)',
            }}
          />
          
          {/* Vertical line for mobile */}
          <div
            className="md:hidden"
            style={{
              position: 'absolute',
              top: '70px',
              bottom: '70px',
              left: '35px',
              width: '2px',
              background: 'linear-gradient(180deg, transparent, #EDE9E4 5%, #EDE9E4 95%, transparent)',
            }}
          />

          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="flex md:flex-col md:items-center md:text-center"
                style={{
                  gap: '20px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {/* Icon container */}
                <div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '24px',
                    backgroundColor: 'white',
                      border: '2px solid #EDE9E4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                      position: 'relative',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                    }}
                    className="md:w-[100px] md:h-[100px] lg:w-[120px] lg:h-[120px] md:rounded-[28px] lg:rounded-[32px] md:mb-6 lg:mb-8"
                  >
                    {/* Background circle */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '16px',
                      backgroundColor: step.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }} className="md:w-[56px] md:h-[56px] lg:w-[64px] lg:h-[64px] md:rounded-[18px] lg:rounded-[20px]">
                      <Icon 
                        size={24} 
                        style={{ color: step.color }} 
                        className="md:w-7 md:h-7 lg:w-8 lg:h-8"
                      />
                    </div>

                    {/* Number badge */}
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      backgroundColor: step.color,
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }} className="md:w-8 md:h-8 md:text-xs md:-top-3 md:-right-3">
                      {step.number}
                    </div>
                </motion.div>
                </div>

                {/* Text content */}
                <div className="flex-1 md:flex-none">
                <h3 style={{
                    fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
                  fontWeight: 600,
                  color: '#1A1714',
                    marginBottom: '8px',
                  }} className="md:mb-3">
                  {step.title}
                </h3>
                <p style={{
                    fontSize: 'clamp(0.875rem, 1.5vw, 0.9375rem)',
                  color: '#6B6259',
                  lineHeight: 1.6,
                  maxWidth: '280px',
                  }} className="md:mx-auto">
                  {step.description}
                </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
