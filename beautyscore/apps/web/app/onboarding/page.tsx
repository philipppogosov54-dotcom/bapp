'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts'

/**
 * Onboarding entry point
 * Redirects to the first incomplete survey
 */
export default function OnboardingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else {
        // Redirect to basic survey (first required survey)
        router.push('/onboarding/survey/basic')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FDFCFB',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #EDE9E4',
        borderTopColor: '#2D7A4F',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
