'use client'

import { useState, useRef, useEffect, use } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Loader2, MessageCircle, Sparkles, User } from 'lucide-react'
import { useProduct, useAskAI } from '@/lib/api/hooks'
import { AIDisclaimer } from '@/components/ui/disclaimer'

// Design system colors [[memory:13485295]]
const colors = {
  bgPrimary: '#FDFCFB',
  bgSecondary: '#F7F5F3',
  bgTertiary: '#EDE9E4',
  textPrimary: '#1A1714',
  textSecondary: '#6B6259',
  textTertiary: '#8C8177',
  accentGreen: '#2D7A4F',
  accentGreenLight: '#E8F5EC',
  accentBlue: '#3B82F6',
  accentBlueLight: '#EFF6FF',
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ProductChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { product, isLoading: isProductLoading } = useProduct(id)
  const { ask, isLoading: isAsking } = useAskAI()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Add initial greeting
  useEffect(() => {
    if (product && messages.length === 0) {
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: `Привет! Я AI-консультант BeautyScore. Задавайте любые вопросы о продукте "${product.name}". Например:\n\n• Подойдёт ли он для моего типа кожи?\n• Какие ингредиенты в составе?\n• С чем лучше сочетать?`,
        timestamp: new Date(),
      }])
    }
  }, [product, messages.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isAsking) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      // Include product context in the question
      const questionWithContext = `Вопрос о продукте "${product?.name}" (${product?.brand || 'без бренда'}): ${input.trim()}`
      const response = await ask(questionWithContext)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте ещё раз.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  if (isProductLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
      }}>
        <Loader2 size={32} style={{ color: colors.accentGreen, animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 180px)',
      minHeight: '400px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${colors.bgTertiary}`,
        marginBottom: '16px',
      }}>
        <Link
          href={`/app/product/${id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: colors.bgSecondary,
            color: colors.textPrimary,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={20} />
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={20} style={{ color: colors.accentBlue }} />
            <h1 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: colors.textPrimary,
              margin: 0,
            }}>
              AI Консультант
            </h1>
          </div>
          <p style={{
            fontSize: '0.8125rem',
            color: colors.textTertiary,
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {product?.name || 'Загрузка...'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingBottom: '16px',
      }}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                gap: '12px',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backgroundColor: message.role === 'user' ? colors.accentGreen : colors.accentBlueLight,
              }}>
                {message.role === 'user' ? (
                  <User size={18} style={{ color: 'white' }} />
                ) : (
                  <Sparkles size={18} style={{ color: colors.accentBlue }} />
                )}
              </div>

              {/* Message Bubble */}
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '16px',
                borderTopLeftRadius: message.role === 'user' ? '16px' : '4px',
                borderTopRightRadius: message.role === 'user' ? '4px' : '16px',
                backgroundColor: message.role === 'user' ? colors.accentGreen : colors.bgSecondary,
                color: message.role === 'user' ? 'white' : colors.textPrimary,
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.9375rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}>
                  {message.content}
                </p>
                <span style={{
                  display: 'block',
                  marginTop: '8px',
                  fontSize: '0.6875rem',
                  opacity: 0.7,
                }}>
                  {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isAsking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              gap: '12px',
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.accentBlueLight,
            }}>
              <Sparkles size={18} style={{ color: colors.accentBlue }} />
            </div>
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px',
              borderTopLeftRadius: '4px',
              backgroundColor: colors.bgSecondary,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: colors.textTertiary,
                animation: 'bounce 1.4s ease-in-out infinite',
              }} />
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: colors.textTertiary,
                animation: 'bounce 1.4s ease-in-out 0.2s infinite',
              }} />
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: colors.textTertiary,
                animation: 'bounce 1.4s ease-in-out 0.4s infinite',
              }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '12px',
          paddingTop: '16px',
          borderTop: `1px solid ${colors.bgTertiary}`,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Задайте вопрос о продукте..."
          disabled={isAsking}
          style={{
            flex: 1,
            height: '48px',
            padding: '0 16px',
            borderRadius: '14px',
            fontSize: '0.9375rem',
            backgroundColor: colors.bgSecondary,
            color: colors.textPrimary,
            border: 'none',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isAsking}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: colors.accentGreen,
            color: 'white',
            border: 'none',
            cursor: !input.trim() || isAsking ? 'not-allowed' : 'pointer',
            opacity: !input.trim() || isAsking ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isAsking ? (
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>

      {/* AI Disclaimer - 152-ФЗ Compliance */}
      <div style={{ marginTop: '12px' }}>
        <AIDisclaimer />
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
