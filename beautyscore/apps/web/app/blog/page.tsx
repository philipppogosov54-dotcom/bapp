import { Metadata } from 'next'
import { ComingSoon } from '@/components/coming-soon'

export const metadata: Metadata = {
  title: 'Блог | BeautyScore',
  description: 'Статьи об уходе за кожей и составе косметики',
}

export default function BlogPage() {
  return (
    <ComingSoon
      icon="📝"
      title="Блог скоро появится"
      description="Мы готовим для вас полезные статьи об ингредиентах косметики, уходе за кожей и осознанном выборе beauty-продуктов. Следите за обновлениями!"
    />
  )
}
