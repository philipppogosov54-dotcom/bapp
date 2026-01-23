'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface SurveyRequiredProps {
  children: React.ReactNode
  hasBasicSurvey: boolean
  hasDermatologySurvey?: boolean
  hasTrichologySurvey?: boolean
  requiredFor?: 'basic' | 'dermatology' | 'trichology' | 'any'
  featureName?: string
}

/**
 * Wrapper component that blocks access to features without required surveys
 * 
 * Usage:
 * <SurveyRequired hasBasicSurvey={user.hasBasicSurvey} requiredFor="basic">
 *   <ProtectedContent />
 * </SurveyRequired>
 */
export function SurveyRequired({
  children,
  hasBasicSurvey,
  hasDermatologySurvey = false,
  hasTrichologySurvey = false,
  requiredFor = 'basic',
  featureName = 'эту функцию',
}: SurveyRequiredProps) {
  const router = useRouter()

  const isAllowed = () => {
    switch (requiredFor) {
      case 'basic':
        return hasBasicSurvey
      case 'dermatology':
        return hasBasicSurvey && hasDermatologySurvey
      case 'trichology':
        return hasBasicSurvey && hasTrichologySurvey
      case 'any':
        return hasBasicSurvey || hasDermatologySurvey || hasTrichologySurvey
      default:
        return hasBasicSurvey
    }
  }

  if (isAllowed()) {
    return <>{children}</>
  }

  const getRequiredSurveyName = () => {
    if (!hasBasicSurvey) return 'базовый опрос'
    if (requiredFor === 'dermatology') return 'опрос по дерматологии'
    if (requiredFor === 'trichology') return 'опрос по трихологии'
    return 'опрос'
  }

  const getSurveyPath = () => {
    if (!hasBasicSurvey) return '/onboarding/survey/basic'
    if (requiredFor === 'dermatology') return '/onboarding/survey/dermatology'
    if (requiredFor === 'trichology') return '/onboarding/survey/trichology'
    return '/onboarding/survey/basic'
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      backgroundColor: '#FDFCFB',
      borderRadius: '16px',
      margin: '24px',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        backgroundColor: '#FEF3C7',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        fontSize: '28px',
      }}>
        🔒
      </div>

      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: 600,
        color: '#1A1714',
        marginBottom: '8px',
      }}>
        Пройдите {getRequiredSurveyName()}
      </h3>

      <p style={{
        fontSize: '0.9375rem',
        color: '#6B6259',
        marginBottom: '24px',
        maxWidth: '280px',
      }}>
        Чтобы использовать {featureName}, нам нужно узнать о вас немного больше.
        Это поможет давать персональные рекомендации.
      </p>

      <Button onClick={() => router.push(getSurveyPath())}>
        Пройти опрос
      </Button>

      <p style={{
        fontSize: '0.75rem',
        color: '#8C8177',
        marginTop: '16px',
      }}>
        Займёт 2-3 минуты
      </p>
    </div>
  )
}

/**
 * Hook to check survey completion status
 */
export function useSurveyStatus() {
  // This should be extended to fetch from API or context
  // For now, returns placeholder
  return {
    hasBasicSurvey: false,
    hasDermatologySurvey: false,
    hasTrichologySurvey: false,
    isLoading: false,
  }
}
