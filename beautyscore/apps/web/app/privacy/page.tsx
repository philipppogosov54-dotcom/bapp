import { Metadata } from 'next'
import { PrivacyContent } from '@/components/legal'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | BeautyScore',
  description: 'Политика конфиденциальности BeautyScore. Узнайте, как мы собираем, используем и защищаем ваши персональные данные в соответствии с 152-ФЗ.',
}

export default function PrivacyPage() {
  return <PrivacyContent />
}
