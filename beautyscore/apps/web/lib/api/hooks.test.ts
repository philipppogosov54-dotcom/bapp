import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useShelf, useProduct, useSearch, useTrends, useLlmChat, useNotifications, useAskAI } from './hooks'
import { api } from './client'

// Mock the API client
vi.mock('./client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockApi = api as jest.Mocked<typeof api>

describe('API Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useShelf', () => {
    const mockShelfItems = [
      {
        id: 'item-1',
        productId: 'product-1',
        product: { id: 'product-1', name: 'Test Cream', brand: 'TestBrand', imageUrl: null, category: 'face' },
        status: 'ACTIVE' as const,
        notes: null,
        rating: null,
        openedAt: null,
        finishedAt: null,
        createdAt: '2024-01-01',
      },
    ]

    it('should load shelf items on mount', async () => {
      mockApi.get.mockResolvedValueOnce({ items: mockShelfItems })

      const { result } = renderHook(() => useShelf())

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.items).toEqual(mockShelfItems)
      expect(result.current.error).toBeNull()
    })

    it('should handle error on load', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useShelf())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
      expect(result.current.items).toEqual([])
    })

    it('should add item to shelf', async () => {
      mockApi.get.mockResolvedValueOnce({ items: [] })
      mockApi.post.mockResolvedValueOnce(mockShelfItems[0])

      const { result } = renderHook(() => useShelf())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.addToShelf('product-1')
      })

      expect(result.current.items).toHaveLength(1)
      expect(mockApi.post).toHaveBeenCalledWith('/shelf', { productId: 'product-1' })
    })

    it('should remove item from shelf', async () => {
      mockApi.get.mockResolvedValueOnce({ items: mockShelfItems })
      mockApi.delete.mockResolvedValueOnce({ deletedAt: '2024-01-01', message: 'Deleted' })

      const { result } = renderHook(() => useShelf())

      await waitFor(() => {
        expect(result.current.items).toHaveLength(1)
      })

      await act(async () => {
        await result.current.removeFromShelf('item-1')
      })

      expect(result.current.items).toHaveLength(0)
    })

    it('should undo remove', async () => {
      mockApi.get.mockResolvedValueOnce({ items: [] })
      mockApi.post.mockResolvedValueOnce(mockShelfItems[0])

      const { result } = renderHook(() => useShelf())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.undoRemove('item-1')
      })

      expect(result.current.items).toHaveLength(1)
      expect(mockApi.post).toHaveBeenCalledWith('/shelf/item-1/undo-delete')
    })
  })

  describe('useProduct', () => {
    const mockProduct = {
      id: 'product-1',
      itemId: 'item-123',
      name: 'Test Cream',
      brand: 'TestBrand',
      productType: 'cream',
      category: 'face',
      categoryPath: 'face/cream',
      description: 'A test cream',
      howToUse: 'Apply daily',
      inci: 'AQUA, GLYCERIN',
      ingredients: ['Aqua', 'Glycerin'],
      imageUrl: null,
      priceRegular: 1000,
      priceDiscount: 800,
      discountPercent: 20,
      inStock: true,
      country: 'Russia',
    }

    const mockScore = {
      score: 85,
      personalized: true,
      pros: ['Good for skin'],
      cons: ['Expensive'],
      recommendation: 'Great choice',
    }

    it('should load product and score', async () => {
      mockApi.get
        .mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce(mockScore)

      const { result } = renderHook(() => useProduct('product-1'))

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.product).toEqual(mockProduct)
      expect(result.current.score).toEqual(mockScore)
      expect(result.current.error).toBeNull()
    })

    it('should handle null productId', async () => {
      const { result } = renderHook(() => useProduct(null))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.product).toBeNull()
      expect(mockApi.get).not.toHaveBeenCalled()
    })

    it('should handle product error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Product not found'))

      const { result } = renderHook(() => useProduct('invalid-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Product not found')
    })

    it('should handle score error gracefully', async () => {
      mockApi.get
        .mockResolvedValueOnce(mockProduct)
        .mockRejectedValueOnce(new Error('Score error'))

      const { result } = renderHook(() => useProduct('product-1'))

      await waitFor(() => {
        expect(result.current.isScoreLoading).toBe(false)
      })

      expect(result.current.product).toEqual(mockProduct)
      expect(result.current.score).toEqual({ score: null, personalized: false })
    })
  })

  describe('useSearch', () => {
    const mockSearchResults = {
      products: [
        { id: '1', name: 'Cream', brand: 'Brand', productType: 'cream', imageUrl: null, priceRegular: 100, priceDiscount: null, score: 80 },
      ],
      total: 1,
      page: 1,
      hasMore: false,
    }

    it('should search products', async () => {
      mockApi.get.mockResolvedValueOnce(mockSearchResults)

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.search('cream')
      })

      expect(result.current.results).toEqual(mockSearchResults)
      expect(result.current.query).toBe('cream')
    })

    it('should not search with short query', async () => {
      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.search('a')
      })

      expect(result.current.results).toBeNull()
      expect(mockApi.get).not.toHaveBeenCalled()
    })

    it('should clear results', async () => {
      mockApi.get.mockResolvedValueOnce(mockSearchResults)

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.search('cream')
      })

      expect(result.current.results).not.toBeNull()

      act(() => {
        result.current.clearResults()
      })

      expect(result.current.results).toBeNull()
      expect(result.current.query).toBe('')
    })

    it('should handle search error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Search failed'))

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.search('cream')
      })

      expect(result.current.error).toBe('Search failed')
    })
  })

  describe('useTrends', () => {
    const mockTrends = {
      products: [
        { id: '1', name: 'Trending', brand: 'Brand', imageUrl: null, score: 90, priceRegular: 100, priceDiscount: null },
      ],
    }

    it('should load trends on mount', async () => {
      mockApi.get
        .mockResolvedValueOnce(mockTrends)
        .mockResolvedValueOnce({ products: [] })

      const { result } = renderHook(() => useTrends())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.trending).toEqual(mockTrends.products)
    })

    it('should handle personalized trends error gracefully', async () => {
      mockApi.get
        .mockResolvedValueOnce(mockTrends)
        .mockRejectedValueOnce(new Error('Not authorized'))

      const { result } = renderHook(() => useTrends())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.trending).toEqual(mockTrends.products)
      expect(result.current.recommended).toEqual([])
    })

    it('should refresh trends', async () => {
      mockApi.get
        .mockResolvedValueOnce(mockTrends)
        .mockResolvedValueOnce({ products: [] })
        .mockResolvedValueOnce({ products: [{ id: '2', name: 'New', brand: 'B', imageUrl: null, score: 95, priceRegular: 200, priceDiscount: null }] })
        .mockResolvedValueOnce({ products: [] })

      const { result } = renderHook(() => useTrends())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.refresh()
      })

      expect(mockApi.get).toHaveBeenCalledTimes(4)
    })
  })

  describe('useLlmChat', () => {
    it('should send message and receive response', async () => {
      mockApi.post.mockResolvedValueOnce({ answer: 'This is a great product', provider: 'yandex' })

      const { result } = renderHook(() => useLlmChat('product-1'))

      await act(async () => {
        await result.current.sendMessage('Is this good for oily skin?')
      })

      expect(result.current.messages).toHaveLength(2)
      expect(result.current.messages[0].role).toBe('user')
      expect(result.current.messages[1].role).toBe('assistant')
      expect(result.current.messages[1].content).toBe('This is a great product')
    })

    it('should not send empty message', async () => {
      const { result } = renderHook(() => useLlmChat())

      await act(async () => {
        await result.current.sendMessage('')
      })

      expect(result.current.messages).toHaveLength(0)
      expect(mockApi.post).not.toHaveBeenCalled()
    })

    it('should handle error and remove user message', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('LLM error'))

      const { result } = renderHook(() => useLlmChat())

      await act(async () => {
        await result.current.sendMessage('Test question')
      })

      expect(result.current.messages).toHaveLength(0)
      expect(result.current.error).toBe('LLM error')
    })

    it('should clear chat', async () => {
      mockApi.post.mockResolvedValueOnce({ answer: 'Response', provider: 'yandex' })

      const { result } = renderHook(() => useLlmChat())

      await act(async () => {
        await result.current.sendMessage('Question')
      })

      expect(result.current.messages).toHaveLength(2)

      act(() => {
        result.current.clearChat()
      })

      expect(result.current.messages).toHaveLength(0)
    })
  })

  describe('useNotifications', () => {
    const mockNotifications = [
      { id: '1', type: 'info', title: 'Test', body: 'Body', read: false, createdAt: '2024-01-01' },
      { id: '2', type: 'info', title: 'Test 2', body: null, read: true, createdAt: '2024-01-02' },
    ]

    it('should load notifications on mount', async () => {
      mockApi.get.mockResolvedValueOnce({ notifications: mockNotifications })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications).toEqual(mockNotifications)
      expect(result.current.unreadCount).toBe(1)
    })

    it('should mark notification as read', async () => {
      mockApi.get.mockResolvedValueOnce({ notifications: mockNotifications })
      mockApi.put.mockResolvedValueOnce({})

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.markAsRead('1')
      })

      expect(result.current.notifications[0].read).toBe(true)
      expect(result.current.unreadCount).toBe(0)
    })

    it('should mark all as read', async () => {
      mockApi.get.mockResolvedValueOnce({ notifications: mockNotifications })
      mockApi.put.mockResolvedValueOnce({})

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.markAllAsRead()
      })

      expect(result.current.notifications.every(n => n.read)).toBe(true)
    })
  })

  describe('useAskAI', () => {
    it('should ask AI and return response', async () => {
      mockApi.post.mockResolvedValueOnce({ answer: 'AI response', provider: 'yandex' })

      const { result } = renderHook(() => useAskAI())

      let response: { answer: string; provider: string } | undefined
      await act(async () => {
        response = await result.current.ask('What is the best cream?')
      })

      expect(response?.answer).toBe('AI response')
      expect(response?.provider).toBe('yandex')
    })

    it('should handle error', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('AI error'))

      const { result } = renderHook(() => useAskAI())

      await act(async () => {
        try {
          await result.current.ask('Question')
        } catch {
          // Expected
        }
      })

      expect(result.current.error).toBe('AI error')
    })
  })
})
