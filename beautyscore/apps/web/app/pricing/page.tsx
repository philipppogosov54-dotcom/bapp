import { Metadata } from 'next'
import { ComingSoon } from '@/components/coming-soon'

export const metadata: Metadata = {
  title: 'Цены | BeautyScore',
  description: 'Тарифы и цены на BeautyScore',
}

export default function PricingPage() {
  return (
    <ComingSoon
      icon="💰"
      title="Тарифные планы в разработке"
      description="Мы работаем над гибкой системой тарифов для BeautyScore. Базовый функционал будет доступен бесплатно. Подпишитесь, чтобы узнать первыми о запуске!"
    />
  )
}
