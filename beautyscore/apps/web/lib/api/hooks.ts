/**
 * API Hooks for BeautyScore
 * React hooks for data fetching with loading/error states
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from './client'

// ============================================
// Types
// ============================================

export interface ShelfItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    brand: string | null
    imageUrl: string | null
    category: string
  }
  /** True if the product was deleted from the database */
  isUnavailable?: boolean
  status: 'ACTIVE' | 'ARCHIVED' | 'WISHLIST' | 'FINISHED'
  notes: string | null
  rating: number | null
  openedAt: string | null
  finishedAt: string | null
  createdAt: string
}

export interface Product {
  id: string
  itemId: string | null
  name: string
  brand: string | null
  productType: string | null
  category: string
  categoryPath: string | null
  description: string | null
  howToUse: string | null
  inci: string | null
  ingredients: string[]
  imageUrl: string | null
  priceRegular: number | null
  priceDiscount: number | null
  discountPercent: number | null
  inStock: boolean
  country: string | null
}

export interface ProductScore {
  score: number | null
  personalized: boolean
  pros?: string[]
  cons?: string[]
  recommendation?: string
}

export interface SearchResult {
  products: Array<{
    id: string
    name: string
    brand: string | null
    productType: string | null
    imageUrl: string | null
    priceRegular: number | null
    priceDiscount: number | null
    score: number | null
  }>
  total: number
  page: number
  hasMore: boolean
}

export interface TrendItem {
  id: string
  name: string
  brand: string | null
  imageUrl: string | null
  score: number | null
  priceRegular: number | null
  priceDiscount: number | null
}

// ============================================
// useShelf Hook (with Optimistic Updates)
// ============================================

export function useShelf() {
  const [items, setItems] = useState<ShelfItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadShelf = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get<{ items: ShelfItem[] }>('/shelf')
      setItems(data.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки полки')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadShelf()
  }, [loadShelf])

  // Optimistic add: immediately show item, then sync with server
  const addToShelf = useCallback(async (productId: string, productInfo?: {
    id: string
    name: string
    brand: string | null
    imageUrl: string | null
    category: string
  }): Promise<ShelfItem> => {
    // Create optimistic item
    const optimisticId = `optimistic-${Date.now()}`
    const optimisticItem: ShelfItem = {
      id: optimisticId,
      productId,
      product: productInfo || {
        id: productId,
        name: 'Добавление...',
        brand: null,
        imageUrl: null,
        category: '',
      },
      status: 'ACTIVE',
      notes: null,
      rating: null,
      openedAt: null,
      finishedAt: null,
      createdAt: new Date().toISOString(),
    }

    // Optimistically add to UI
    setItems(prev => [optimisticItem, ...prev])

    try {
      // Sync with server
      const item = await api.post<ShelfItem>('/shelf', { productId })
      // Replace optimistic item with real item
      setItems(prev => [item, ...prev.filter(i => i.id !== optimisticId)])
      return item
    } catch (err) {
      // Rollback on error
      setItems(prev => prev.filter(i => i.id !== optimisticId))
      throw err
    }
  }, [])

  // Optimistic remove: immediately hide item, then sync with server
  const removeFromShelf = useCallback(async (itemId: string): Promise<{ deletedAt: string }> => {
    // Store item for potential rollback
    const removedItem = items.find(item => item.id === itemId)
    
    // Optimistically remove from UI
    setItems(prev => prev.filter(item => item.id !== itemId))

    try {
      // Sync with server
      const result = await api.delete<{ deletedAt: string; message: string }>(`/shelf/${itemId}`)
      return { deletedAt: result.deletedAt || new Date().toISOString() }
    } catch (err) {
      // Rollback on error - restore item at original position
      if (removedItem) {
        setItems(prev => {
          // Find original index or add to beginning
          const originalIndex = items.findIndex(i => i.id === itemId)
          const newItems = [...prev]
          if (originalIndex >= 0 && originalIndex < newItems.length) {
            newItems.splice(originalIndex, 0, removedItem)
          } else {
            newItems.unshift(removedItem)
          }
          return newItems
        })
      }
      throw err
    }
  }, [items])

  // Optimistic undo: immediately show item, then sync with server
  const undoRemove = useCallback(async (itemId: string): Promise<ShelfItem> => {
    try {
      const item = await api.post<ShelfItem>(`/shelf/${itemId}/undo-delete`)
      setItems(prev => [item, ...prev.filter(i => i.id !== itemId)])
      return item
    } catch (err) {
      throw err
    }
  }, [])

  return {
    items,
    isLoading,
    error,
    refresh: loadShelf,
    addToShelf,
    removeFromShelf,
    undoRemove,
  }
}

// ============================================
// useProduct Hook
// ============================================

export function useProduct(productId: string | null) {
  const [product, setProduct] = useState<Product | null>(null)
  const [score, setScore] = useState<ProductScore | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScoreLoading, setIsScoreLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!productId) {
      setIsLoading(false)
      return
    }

    const loadProduct = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await api.get<Product>(`/products/${productId}`)
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Продукт не найден')
      } finally {
        setIsLoading(false)
      }
    }

    const loadScore = async () => {
      setIsScoreLoading(true)
      try {
        const data = await api.get<ProductScore>(`/products/${productId}/score`)
        setScore(data)
      } catch {
        // Score error is not critical
        setScore({ score: null, personalized: false })
      } finally {
        setIsScoreLoading(false)
      }
    }

    loadProduct()
    loadScore()
  }, [productId])

  return {
    product,
    score,
    isLoading,
    isScoreLoading,
    error,
  }
}

// ============================================
// useSearch Hook
// ============================================

// Edge Case: Maximum query length
const MAX_QUERY_LENGTH = 500

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (searchQuery: string, page = 1) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults(null)
      return
    }

    // Edge Case: Truncate query if > 500 characters
    const truncatedQuery = searchQuery.length > MAX_QUERY_LENGTH 
      ? searchQuery.slice(0, MAX_QUERY_LENGTH) 
      : searchQuery

    setIsLoading(true)
    setError(null)
    setQuery(truncatedQuery)

    try {
      const params = new URLSearchParams({ q: truncatedQuery, page: String(page) })
      const data = await api.get<SearchResult>(`/search?${params}`)
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка поиска')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults(null)
    setQuery('')
  }, [])

  return {
    query,
    results,
    isLoading,
    error,
    search,
    clearResults,
  }
}

// ============================================
// useTrends Hook
// ============================================

// Type for individual trend
interface TrendCategory {
  id: string
  title: string
  description: string
  products: TrendItem[]
  category?: string
}

interface TrendsResponse {
  featured: TrendCategory
  categories: TrendCategory[]
}

interface PersonalizedResponse {
  forYou: TrendCategory[]
  based_on: string[]
}

export function useTrends() {
  const [featured, setFeatured] = useState<TrendCategory | null>(null)
  const [categories, setCategories] = useState<TrendCategory[]>([])
  const [personalized, setPersonalized] = useState<TrendCategory[]>([])
  const [basedOn, setBasedOn] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTrends = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [trendsData, personalizedData] = await Promise.all([
          api.get<TrendsResponse>('/trends'),
          api.get<PersonalizedResponse>('/trends/personalized').catch(() => ({ forYou: [], based_on: [] })),
        ])
        setFeatured(trendsData.featured)
        setCategories(trendsData.categories || [])
        setPersonalized(personalizedData.forYou || [])
        setBasedOn(personalizedData.based_on || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки трендов')
      } finally {
        setIsLoading(false)
      }
    }

    loadTrends()
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [trendsData, personalizedData] = await Promise.all([
        api.get<TrendsResponse>('/trends'),
        api.get<PersonalizedResponse>('/trends/personalized').catch(() => ({ forYou: [], based_on: [] })),
      ])
      setFeatured(trendsData.featured)
      setCategories(trendsData.categories || [])
      setPersonalized(personalizedData.forYou || [])
      setBasedOn(personalizedData.based_on || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки трендов')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Legacy compatibility: flatten trends to products array  
  const trending = featured?.products || []
  const recommended = personalized.flatMap(p => p.products)

  return {
    // New structured data
    featured,
    categories,
    personalized,
    basedOn,
    // Legacy compatibility
    trending,
    recommended,
    isLoading,
    error,
    refresh,
  }
}

// ============================================
// useLlmChat Hook
// ============================================

export function useLlmChat(productId?: string) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (question: string) => {
    if (!question.trim()) return

    const userMessage = { role: 'user' as const, content: question }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      let response: { answer: string; provider: string }

      if (productId) {
        // Ask about specific product
        response = await api.post<{ answer: string; provider: string }>(
          `/products/${productId}/ask`,
          { question, history: messages }
        )
      } else {
        // General LLM chat
        response = await api.post<{ answer: string; provider: string }>(
          '/search/ask',
          { question }
        )
      }

      const assistantMessage = { role: 'assistant' as const, content: response.answer }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка получения ответа')
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }, [productId, messages])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  }
}

// ============================================
// useAskAI Hook (simple version for chat page)
// ============================================

export function useAskAI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ask = useCallback(async (question: string): Promise<{ answer: string; provider: string }> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.post<{ answer: string; provider: string }>(
        '/search/ask',
        { question }
      )
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка получения ответа'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    ask,
    isLoading,
    error,
  }
}

// ============================================
// useProfile Hook (for data export and account deletion)
// ============================================

export function useProfile() {
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Export user data (152-ФЗ compliance)
  const exportData = useCallback(async (): Promise<void> => {
    setIsExporting(true)
    setError(null)
    
    try {
      const data = await api.get<Record<string, unknown>>('/profile/export')
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `beautyscore-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка экспорта данных'
      setError(errorMessage)
      throw err
    } finally {
      setIsExporting(false)
    }
  }, [])

  // Delete account (soft delete with 30-day retention per 152-ФЗ)
  const deleteAccount = useCallback(async (): Promise<void> => {
    setIsDeleting(true)
    setError(null)
    
    try {
      await api.delete('/profile')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления аккаунта'
      setError(errorMessage)
      throw err
    } finally {
      setIsDeleting(false)
    }
  }, [])

  // Undo account deletion (within 30-day window)
  const undoDelete = useCallback(async (): Promise<void> => {
    try {
      await api.post('/profile/undo-delete')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка восстановления аккаунта'
      setError(errorMessage)
      throw err
    }
  }, [])

  return {
    exportData,
    deleteAccount,
    undoDelete,
    isExporting,
    isDeleting,
    error,
  }
}

// ============================================
// useShelfAnalysis Hook (PRD Gap: Shelf Analysis)
// ============================================

export interface ShelfAnalysis {
  overallScore: number
  recommendation: string
  conflicts: Array<{ products: string[]; reason: string }>
  synergies: Array<{ products: string[]; benefit: string }>
  suggestions: Array<{ type: 'add' | 'replace' | 'remove'; product: string; reason: string }>
}

export function useShelfAnalysis() {
  const [analysis, setAnalysis] = useState<ShelfAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await api.get<{ analysis: ShelfAnalysis }>('/shelf/analyze')
      setAnalysis(data.analysis)
      return data.analysis
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка анализа полки'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setAnalysis(null)
    setError(null)
  }, [])

  return {
    analysis,
    isLoading,
    error,
    analyze,
    reset,
  }
}

// ============================================
// useSearchHistory Hook (I-1)
// ============================================

export interface SearchHistoryItem {
  id: string
  query: string
  type: string
  createdAt: string
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch search history
  const fetchHistory = useCallback(async (limit = 20) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await api.get<{ history: SearchHistoryItem[] }>(`/search/history?limit=${limit}`)
      setHistory(data.history || [])
    } catch (err) {
      // Silently fail for history - not critical
      setError(err instanceof Error ? err.message : 'Ошибка загрузки истории')
      setHistory([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Delete single history item
  const deleteItem = useCallback(async (historyId: string) => {
    try {
      await api.delete(`/search/history/${historyId}`)
      setHistory(prev => prev.filter(h => h.id !== historyId))
    } catch (err) {
      console.error('Failed to delete history item:', err)
    }
  }, [])

  // Clear all history
  const clearAll = useCallback(async () => {
    try {
      await api.delete('/search/history')
      setHistory([])
    } catch (err) {
      console.error('Failed to clear history:', err)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    history,
    isLoading,
    error,
    refresh: fetchHistory,
    deleteItem,
    clearAll,
  }
}

// ============================================
// useNotifications Hook
// ============================================

export interface NotificationItem {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  data: Record<string, unknown> | null
  createdAt: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch notifications
  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = unreadOnly ? '?unreadOnly=true' : ''
      const data = await api.get<{ notifications: NotificationItem[]; unreadCount: number }>(
        `/notifications${params}`
      )
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки уведомлений')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
