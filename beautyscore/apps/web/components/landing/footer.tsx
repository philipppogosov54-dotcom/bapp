'use client'

import Link from 'next/link'

const footerLinks = {
  product: {
    title: 'Продукт',
    links: [
    { label: 'Возможности', href: '#features' },
    { label: 'Как это работает', href: '#how-it-works' },
      { label: 'Цены', href: '/pricing' },
    { label: 'Демо', href: '/demo' },
  ],
  },
  company: {
    title: 'Компания',
    links: [
    { label: 'О нас', href: '/about' },
      { label: 'Блог', href: '/blog' },
      { label: 'Карьера', href: '/careers' },
    { label: 'Контакты', href: '/contact' },
    ],
  },
  legal: {
    title: 'Правовая информация',
    links: [
      { label: 'Условия использования', href: '/terms' },
      { label: 'Политика конфиденциальности', href: '/privacy' },
      { label: 'Cookie-политика', href: '/cookies' },
  ],
  },
}

export function Footer() {
  return (
    <footer style={{
      padding: '48px 16px 24px',
      backgroundColor: '#F7F5F3',
      borderTop: '1px solid #EDE9E4',
    }} className="md:py-16 lg:py-20 md:px-6">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Main footer content */}
        <div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6"
          style={{ marginBottom: '48px' }}
        >
          {/* Brand */}
          <div className="col-span-2 md:col-span-1" style={{ marginBottom: '8px' }}>
            <Link href="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              marginBottom: '16px',
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
            <p style={{
              fontSize: '0.875rem',
              color: '#6B6259',
              lineHeight: 1.6,
              marginTop: '16px',
              maxWidth: '200px',
            }}>
              Делаем анализ состава косметики понятным для каждого.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 style={{
                fontSize: '0.75rem',
              fontWeight: 600,
                color: '#8C8177',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
                marginBottom: '16px',
            }}>
                {section.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {section.links.map((link) => (
                  <li key={link.href}>
                  <Link href={link.href} style={{
              fontSize: '0.875rem',
                      color: '#6B6259',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          backgroundColor: '#EDE9E4',
          marginBottom: '24px',
        }} />

        {/* Bottom bar */}
        <div 
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p style={{
            fontSize: '0.8125rem',
            color: '#8C8177',
            textAlign: 'center',
          }} className="md:text-left">
            © 2025 BeautyScore. Все права защищены.
          </p>
          
          {/* Social links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            {['VK', 'TG', 'YT'].map((social) => (
              <Link
                key={social}
                href="#"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#EDE9E4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#6B6259',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
