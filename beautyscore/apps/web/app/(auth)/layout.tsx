'use client'

import { usePathname } from 'next/navigation'
import { SplitLayout } from '@/components/layouts'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLogin = pathname === '/login'
  const isPhoneLogin = pathname === '/phone-login'

  // Determine content based on current page
  const getLayoutProps = () => {
    if (isLogin || isPhoneLogin) {
      return {
        title: 'Рады видеть вас снова!',
        subtitle: 'Войдите в аккаунт, чтобы продолжить анализировать составы и получать персональные рекомендации.',
        icon: '👋',
      }
    }
    return {
      title: 'Присоединяйтесь к нам!',
      subtitle: 'Создайте аккаунт и начните узнавать правду о своей косметике. Это бесплатно!',
      icon: '✨',
    }
  }

  return (
    <SplitLayout {...getLayoutProps()}>
      {children}
    </SplitLayout>
  )
}
