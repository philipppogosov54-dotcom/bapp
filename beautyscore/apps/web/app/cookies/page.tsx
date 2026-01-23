import { Metadata } from 'next'
import { CookiesContent } from '@/components/legal'

export const metadata: Metadata = {
  title: 'Cookie-политика | BeautyScore',
  description: 'Cookie-политика BeautyScore. Узнайте, какие cookies мы используем и как ими управлять.',
}

export default function CookiesPage() {
  return <CookiesContent />
}
