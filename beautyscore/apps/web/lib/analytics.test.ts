import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  analytics, 
  track, 
  authEvents, 
  searchEvents, 
  productEvents, 
  shelfEvents, 
  profileEvents, 
  llmEvents,
  navigationEvents,
  errorEvents,
  initAnalytics,
  setUserId,
} from './analytics'

describe('Analytics', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.stubEnv('NODE_ENV', 'development')
    vi.clearAllMocks()
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('track', () => {
    it('should track event with category and action', () => {
      track('product', 'view', { label: 'product-1' })

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics]',
        'product',
        'view',
        'product-1'
      )
    })

    it('should track event without label', () => {
      track('auth', 'logout')

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics]',
        'auth',
        'logout',
        ''
      )
    })
  })

  describe('authEvents', () => {
    it('should track login', () => {
      authEvents.login('email')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'auth', 'login', 'email')
    })

    it('should track login failed', () => {
      authEvents.loginFailed('email', 'Invalid password')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'auth', 'login_failed', 'email')
    })

    it('should track register', () => {
      authEvents.register('vk')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'auth', 'register', 'vk')
    })

    it('should track logout', () => {
      authEvents.logout()
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'auth', 'logout', '')
    })

    it('should track password reset', () => {
      authEvents.passwordReset()
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'auth', 'password_reset_requested', '')
    })
  })

  describe('searchEvents', () => {
    it('should track search', () => {
      searchEvents.search('крем для лица', 10)
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'search', 'search', 'крем для лица')
    })

    it('should track no results', () => {
      searchEvents.noResults('несуществующий продукт')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'search', 'no_results', 'несуществующий продукт')
    })

    it('should track result clicked', () => {
      searchEvents.resultClicked('product-1', 3)
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'search', 'result_clicked', 'product-1')
    })

    it('should track AI ask', () => {
      searchEvents.aiAsk(50)
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'search', 'ai_ask', '')
    })
  })

  describe('productEvents', () => {
    it('should track product view', () => {
      productEvents.view('product-1', 'search')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'product', 'view', 'product-1')
    })

    it('should track score loaded', () => {
      productEvents.scoreLoaded('product-1', 85, true)
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'product', 'score_loaded', 'product-1')
    })

    it('should track ingredients expanded', () => {
      productEvents.ingredientsExpanded('product-1')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'product', 'ingredients_expanded', 'product-1')
    })

    it('should track AI chat opened', () => {
      productEvents.aiChatOpened('product-1')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'product', 'ai_chat_opened', 'product-1')
    })
  })

  describe('shelfEvents', () => {
    it('should track add product', () => {
      shelfEvents.addProduct('product-1')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'shelf', 'add_product', 'product-1')
    })

    it('should track remove product', () => {
      shelfEvents.removeProduct('product-1')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'shelf', 'remove_product', 'product-1')
    })

    it('should track undo remove', () => {
      shelfEvents.undoRemove('product-1')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'shelf', 'undo_remove', 'product-1')
    })

    it('should track undo expired', () => {
      shelfEvents.undoExpired('product-1')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'shelf', 'undo_expired', 'product-1')
    })
  })

  describe('profileEvents', () => {
    it('should track profile view', () => {
      profileEvents.view()
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'profile', 'view', '')
    })

    it('should track survey started', () => {
      profileEvents.surveyStarted('BASIC')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'profile', 'survey_started', 'BASIC')
    })

    it('should track survey completed', () => {
      profileEvents.surveyCompleted('DERMATOLOGY')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'profile', 'survey_completed', 'DERMATOLOGY')
    })
  })

  describe('llmEvents', () => {
    it('should track request sent', () => {
      llmEvents.requestSent('/search/ask')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'llm', 'request_sent', '/search/ask')
    })

    it('should track response received', () => {
      llmEvents.responseReceived('yandex', 1500)
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'llm', 'response_received', 'yandex')
    })

    it('should track fallback used', () => {
      llmEvents.fallbackUsed('yandex', 'gigachat')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'llm', 'fallback_used', 'yandex -> gigachat')
    })

    it('should track timeout', () => {
      llmEvents.timeout('yandex')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'llm', 'timeout', 'yandex')
    })
  })

  describe('navigationEvents', () => {
    it('should track page view', () => {
      navigationEvents.pageView('/app/shelf')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'navigation', 'page_view', '/app/shelf')
    })

    it('should track tab switch', () => {
      navigationEvents.tabSwitch('shelf', 'trends')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'navigation', 'tab_switch', 'shelf -> trends')
    })
  })

  describe('errorEvents', () => {
    it('should track API error', () => {
      errorEvents.apiError('/products/123', 404, 'Not found')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'error', 'api_error', '/products/123')
    })

    it('should track JS error', () => {
      const error = new Error('Test error')
      errorEvents.jsError(error)
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'error', 'js_error', 'Test error')
    })
  })

  describe('analytics object', () => {
    it('should expose all event groups', () => {
      expect(analytics.auth).toBe(authEvents)
      expect(analytics.search).toBe(searchEvents)
      expect(analytics.product).toBe(productEvents)
      expect(analytics.shelf).toBe(shelfEvents)
      expect(analytics.profile).toBe(profileEvents)
      expect(analytics.llm).toBe(llmEvents)
      expect(analytics.navigation).toBe(navigationEvents)
      expect(analytics.error).toBe(errorEvents)
      expect(analytics.track).toBe(track)
    })
  })

  describe('initAnalytics', () => {
    it('should initialize analytics', () => {
      initAnalytics()
      // Should not throw
    })

    it('should initialize with userId', () => {
      initAnalytics('user-123')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'auth', 'session_start', '')
    })
  })

  describe('setUserId', () => {
    it('should set user ID', () => {
      setUserId('user-123')
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'auth', 'user_identified', '')
    })
  })
})
