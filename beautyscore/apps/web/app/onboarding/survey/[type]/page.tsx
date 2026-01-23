'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api/client'
import { analytics } from '@/lib/analytics'

interface Question {
  id: string
  question: string
  description?: string
  type: 'single' | 'multiple' | 'text'
  options?: Array<{ value: string; label: string; description?: string }>
  required: boolean
  validation?: { max?: number }
}

interface SurveyData {
  type: string
  title: string
  description: string
  questions: Question[]
  answers: Record<string, string | string[]> | null
  progress: number
}

export default function SurveyPage() {
  const router = useRouter()
  const params = useParams()
  const type = (params.type as string)?.toUpperCase()
  const { user, refreshUser } = useAuth()

  const [survey, setSurvey] = useState<SurveyData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  // Load survey data
  useEffect(() => {
    if (!type) return
    loadSurvey()
  }, [type])

  const loadSurvey = async () => {
    try {
      setIsLoading(true)
      const result = await api.get<{ data: SurveyData }>(`/surveys/${type}`)
      setSurvey(result.data)
      
      // Track survey start
      analytics.surveyStart(type)
      startTimeRef.current = Date.now()
      
      // Restore answers if any
      if (result.data.answers) {
        setAnswers(result.data.answers)
        // Find first unanswered question
        const firstUnanswered = result.data.questions.findIndex(
          q => !result.data.answers?.[q.id]
        )
        if (firstUnanswered > 0) {
          setCurrentIndex(firstUnanswered)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки опроса')
    } finally {
      setIsLoading(false)
    }
  }

  const currentQuestion = survey?.questions[currentIndex]
  const totalQuestions = survey?.questions.length || 0
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0

  const handleAnswer = (value: string) => {
    if (!currentQuestion) return

    if (currentQuestion.type === 'multiple') {
      const current = (answers[currentQuestion.id] as string[]) || []
      const maxAllowed = currentQuestion.validation?.max || 99
      
      if (current.includes(value)) {
        // Remove
        setAnswers({ ...answers, [currentQuestion.id]: current.filter(v => v !== value) })
      } else if (current.length < maxAllowed) {
        // Add
        setAnswers({ ...answers, [currentQuestion.id]: [...current, value] })
      }
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: value })
    }
  }

  const isAnswered = (questionId: string) => {
    const answer = answers[questionId]
    return answer && (Array.isArray(answer) ? answer.length > 0 : true)
  }

  const saveProgress = async () => {
    try {
      setIsSaving(true)
      await api.post(`/surveys/${type}`, { answers, isComplete: false })
    } catch {
      // Silent fail for progress save
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async () => {
    if (!currentQuestion) return

    // Save progress
    await saveProgress()

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Complete survey
      await handleComplete()
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleComplete = async () => {
    try {
      setIsSaving(true)
      await api.post(`/surveys/${type}`, { answers, isComplete: true })
      
      // Track survey completion
      analytics.surveyComplete(type)
      
      // Refresh user data to get updated surveys
      await refreshUser?.()
      
      // Navigate to completion or next survey
      router.push('/onboarding/complete')
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения')
    } finally {
      setIsSaving(false)
    }
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

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#FDFCFB',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😔</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1A1714', marginBottom: '8px' }}>
          Ошибка
        </h2>
        <p style={{ color: '#6B6259', marginBottom: '24px' }}>{error}</p>
        <Button onClick={loadSurvey}>Попробовать снова</Button>
      </div>
    )
  }

  if (!survey || !currentQuestion) {
    return null
  }

  const surveyTitles: Record<string, string> = {
    BASIC: 'Базовый опрос',
    DERMATOLOGY: 'Дерматология',
    TRICHOLOGY: 'Трихология',
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FDFCFB',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #EDE9E4',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: currentIndex === 0 ? 'default' : 'pointer',
              opacity: currentIndex === 0 ? 0.3 : 1,
            }}
          >
            ←
          </button>
          <span style={{ fontSize: '0.875rem', color: '#6B6259' }}>
            {surveyTitles[type] || type}
          </span>
          <span style={{ fontSize: '0.875rem', color: '#6B6259' }}>
            {currentIndex + 1}/{totalQuestions}
          </span>
        </div>
        
        {/* Progress bar */}
        <div style={{
          height: '4px',
          backgroundColor: '#EDE9E4',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#2D7A4F',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Question */}
      <div style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#1A1714',
          marginBottom: '8px',
        }}>
          {currentQuestion.question}
        </h2>
        
        {currentQuestion.description && (
          <p style={{
            fontSize: '0.9375rem',
            color: '#6B6259',
            marginBottom: '24px',
          }}>
            {currentQuestion.description}
          </p>
        )}

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQuestion.options?.map(option => {
            const isSelected = currentQuestion.type === 'multiple'
              ? (answers[currentQuestion.id] as string[] || []).includes(option.value)
              : answers[currentQuestion.id] === option.value

            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: isSelected ? '#E8F5EC' : '#F7F5F3',
                  border: isSelected ? '2px solid #2D7A4F' : '2px solid transparent',
                  borderRadius: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Checkbox/Radio indicator */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: currentQuestion.type === 'multiple' ? '6px' : '50%',
                  border: isSelected ? 'none' : '2px solid #C4BFBA',
                  backgroundColor: isSelected ? '#2D7A4F' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {isSelected && (
                    <span style={{ color: 'white', fontSize: '14px' }}>✓</span>
                  )}
                </div>
                
                <div>
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#1A1714',
                  }}>
                    {option.label}
                  </span>
                  {option.description && (
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6B6259',
                      marginTop: '4px',
                    }}>
                      {option.description}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer - I-9: Added Skip option */}
      <div style={{
        padding: '16px 24px 32px',
        borderTop: '1px solid #EDE9E4',
      }}>
        <Button
          onClick={handleNext}
          size="lg"
          style={{ width: '100%', marginBottom: '12px' }}
          disabled={!isAnswered(currentQuestion.id) || isSaving}
          loading={isSaving}
        >
          {currentIndex === totalQuestions - 1 ? 'Завершить' : 'Далее'}
        </Button>
        
        {/* Skip option */}
        <button
          onClick={() => {
            analytics.surveySkip(type)
            router.push('/app')
          }}
          style={{
            width: '100%',
            padding: '12px',
            background: 'none',
            border: 'none',
            color: '#8C8177',
            fontSize: '0.875rem',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          Пропустить и заполнить позже
        </button>
      </div>
    </div>
  )
}
