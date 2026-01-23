import { Metadata } from 'next'
import { ComingSoon } from '@/components/coming-soon'

export const metadata: Metadata = {
  title: 'О нас | BeautyScore',
  description: 'О команде и миссии BeautyScore',
}

export default function AboutPage() {
  return (
    <ComingSoon
      icon="💚"
      title="Наша история в разработке"
      description="Мы — команда энтузиастов, которые верят в осознанный выбор косметики. Скоро здесь появится полная информация о нашей миссии, команде и ценностях."
    />
  )
}
