import { Metadata } from 'next'
import { ComingSoon } from '@/components/coming-soon'

export const metadata: Metadata = {
  title: 'Вакансии | BeautyScore',
  description: 'Карьера в BeautyScore - присоединяйтесь к команде',
}

export default function CareersPage() {
  return (
    <ComingSoon
      icon="🚀"
      title="Вакансии появятся скоро"
      description="Мы активно растем и скоро будем искать талантливых специалистов в нашу команду. Хотите работать над продуктом, который помогает людям? Следите за обновлениями!"
    />
  )
}
