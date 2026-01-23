import { Metadata } from 'next'
import { ComingSoon } from '@/components/coming-soon'

export const metadata: Metadata = {
  title: 'Демо | BeautyScore',
  description: 'Демонстрация функционала BeautyScore - анализ состава косметики',
}

export default function DemoPage() {
  return (
    <ComingSoon
      icon="🎬"
      title="Демо скоро будет доступно"
      description="Мы работаем над интерактивной демонстрацией всех возможностей BeautyScore. Скоро вы сможете протестировать анализ состава косметики без регистрации."
    />
  )
}
