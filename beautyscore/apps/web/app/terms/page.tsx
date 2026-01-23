import { Metadata } from 'next'
import { TermsContent } from '@/components/legal'

export const metadata: Metadata = {
  title: 'Условия использования | BeautyScore',
  description: 'Условия использования сервиса BeautyScore. Ознакомьтесь с правилами использования платформы AI-анализа косметики.',
}

export default function TermsPage() {
  return <TermsContent />
}
