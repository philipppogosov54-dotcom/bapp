'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api/client'

interface SurveyStatus {
  type: string
  title: string
  completed: boolean
}

export default function SurveyCompletePage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [surveys, setSurveys] = useState<SurveyStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSurveys()
  }, [])

  const loadSurveys = async () => {
    try {
      const result = await api.get<{ data: SurveyStatus[] }>('/surveys')
      setSurveys(result.data)
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false)
    }
  }

  const completedCount = surveys.filter(s => s.completed).length
  const allCompleted = completedCount === surveys.length && surveys.length > 0
  const hasBasic = surveys.find(s => s.type === 'BASIC')?.completed

  const getNextSurvey = () => {
    const order = ['BASIC', 'DERMATOLOGY', 'TRICHOLOGY']
    for (const type of order) {
      const survey = surveys.find(s => s.type === type)
      if (survey && !survey.completed) {
        return survey
      }
    }
    return null
  }

  const nextSurvey = getNextSurvey()

  const handleContinue = () => {
    if (nextSurvey) {
      router.push(`/onboarding/survey/${nextSurvey.type.toLowerCase()}`)
    } else {
      router.push('/app')
    }
  }

  const handleSkip = async () => {
    // Refresh user to ensure latest data
    await refreshUser?.()
    router.push('/app')
  }

  if (isLoading) {
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FDFCFB',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Success icon */}
      <div style={{
        width: '80px',
        height: '80px',
        backgroundColor: '#E8F5EC',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        fontSize: '40px',
      }}>
        {allCompleted ? '🎉' : '✅'}
      </div>

      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#1A1714',
        marginBottom: '8px',
        textAlign: 'center',
      }}>
        {allCompleted ? 'Отлично!' : 'Опрос завершён!'}
      </h1>

      <p style={{
        fontSize: '1rem',
        color: '#6B6259',
        textAlign: 'center',
        marginBottom: '32px',
        maxWidth: '320px',
      }}>
        {allCompleted 
          ? 'Все опросы пройдены. Теперь рекомендации будут максимально точными!'
          : 'Вы можете продолжить с другими опросами для более точных рекомендаций'}
      </p>

      {/* Survey status */}
      <div style={{
        width: '100%',
        maxWidth: '320px',
        marginBottom: '32px',
      }}>
        {surveys.map(survey => (
          <div
            key={survey.type}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: survey.completed ? '#E8F5EC' : '#F7F5F3',
              borderRadius: '12px',
              marginBottom: '8px',
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: survey.completed ? '#2D7A4F' : '#C4BFBA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {survey.completed ? (
                <span style={{ color: 'white', fontSize: '14px' }}>✓</span>
              ) : (
                <span style={{ color: 'white', fontSize: '12px' }}>○</span>
              )}
            </div>
            <span style={{
              flex: 1,
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: survey.completed ? '#2D7A4F' : '#6B6259',
            }}>
              {survey.title}
            </span>
            {!survey.completed && (
              <span style={{ fontSize: '0.75rem', color: '#8C8177' }}>
                Не пройден
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ width: '100%', maxWidth: '320px' }}>
        <Button
          onClick={handleContinue}
          size="lg"
          style={{ width: '100%', marginBottom: '12px' }}
        >
          {allCompleted ? 'Начать использовать' : nextSurvey ? `Пройти: ${nextSurvey.title}` : 'Продолжить'}
        </Button>

        {!allCompleted && hasBasic && (
          <button
            onClick={handleSkip}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6B6259',
              fontSize: '0.9375rem',
              cursor: 'pointer',
            }}
          >
            Пропустить и продолжить
          </button>
        )}
      </div>
    </div>
  )
}
