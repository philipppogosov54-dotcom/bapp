import { Metadata } from 'next'
import { ComingSoon } from '@/components/coming-soon'

export const metadata: Metadata = {
  title: 'Контакты | BeautyScore',
  description: 'Свяжитесь с командой BeautyScore',
}

export default function ContactPage() {
  return (
    <ComingSoon
      icon="📧"
      title="Форма обратной связи в разработке"
      description="Мы работаем над удобной формой для связи с нами. А пока вы можете написать нам на support@beautyscore.ru"
    />
  )
}
