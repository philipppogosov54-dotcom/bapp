/**
 * Analytics Module for BeautyScore
 * Tracks user events for product improvement and personalization
 * 
 * Events are stored locally and can be sent to analytics backend
 * when configured (e.g., Yandex.Metrica, custom backend)
 */

// ============================================
// Types
// ============================================

export type EventCategory = 
  | 'auth'
  | 'onboarding'
  | 'search'
  | 'product'
  | 'shelf'
  | 'profile'
  | 'llm'
  | 'navigation'
  | 'error'

export interface AnalyticsEvent {
  category: EventCategory
  action: string
  label?: string
  value?: number
  metadata?: Record<string, unknown>
  timestamp: number
  sessionId: string
  userId?: string
}

// ============================================
// Session Management
// ============================================

let sessionId: string | null = null

function getSessionId(): string {
  if (sessionId) return sessionId
  
  // Check localStorage for existing session
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('bs_session_id')
    const storedTime = localStorage.getItem('bs_session_time')
    
    // Session expires after 30 minutes of inactivity
    if (stored && storedTime) {
      const elapsed = Date.now() - parseInt(storedTime, 10)
      if (elapsed < 30 * 60 * 1000) {
        sessionId = stored
        localStorage.setItem('bs_session_time', String(Date.now()))
        return sessionId
      }
    }
    
    // Create new session
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    localStorage.setItem('bs_session_id', sessionId)
    localStorage.setItem('bs_session_time', String(Date.now()))
  } else {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }
  
  return sessionId
}

// ============================================
// Event Queue (for batch sending)
// ============================================

const eventQueue: AnalyticsEvent[] = []
const MAX_QUEUE_SIZE = 50

function flushEvents(): void {
  if (eventQueue.length === 0) return
  
  // In production, this would send to analytics backend
  // For now, just log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Flushing events:', eventQueue.length)
  }
  
  // TODO: Send to backend when configured
  // api.post('/analytics/events', { events: eventQueue })
  
  eventQueue.length = 0
}

// ============================================
// Core Tracking Function
// ============================================

export function track(
  category: EventCategory,
  action: string,
  options?: {
    label?: string
    value?: number
    metadata?: Record<string, unknown>
    userId?: string
  }
): void {
  const event: AnalyticsEvent = {
    category,
    action,
    label: options?.label,
    value: options?.value,
    metadata: options?.metadata,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    userId: options?.userId,
  }
  
  eventQueue.push(event)
  
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', category, action, options?.label || '')
  }
  
  // Flush if queue is full
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    flushEvents()
  }
}

// ============================================
// Auth Events
// ============================================

export const authEvents = {
  login: (method: 'email' | 'vk' | 'yandex' | 'telegram' | 'phone') => {
    track('auth', 'login', { label: method })
  },
  
  loginFailed: (method: string, error: string) => {
    track('auth', 'login_failed', { label: method, metadata: { error } })
  },
  
  register: (method: 'email' | 'vk' | 'yandex' | 'telegram' | 'phone') => {
    track('auth', 'register', { label: method })
  },
  
  logout: () => {
    track('auth', 'logout')
  },
  
  passwordReset: () => {
    track('auth', 'password_reset_requested')
  },
}

// ============================================
// Onboarding Events
// ============================================

export const onboardingEvents = {
  started: () => {
    track('onboarding', 'started')
  },
  
  stepCompleted: (step: string, stepNumber: number) => {
    track('onboarding', 'step_completed', { label: step, value: stepNumber })
  },
  
  skipped: (atStep: string) => {
    track('onboarding', 'skipped', { label: atStep })
  },
  
  completed: (totalTime: number) => {
    track('onboarding', 'completed', { value: totalTime })
  },
}

// ============================================
// Search Events
// ============================================

export const searchEvents = {
  search: (query: string, resultsCount: number) => {
    track('search', 'search', { 
      label: query.slice(0, 50), // Truncate for privacy
      value: resultsCount 
    })
  },
  
  noResults: (query: string) => {
    track('search', 'no_results', { label: query.slice(0, 50) })
  },
  
  resultClicked: (productId: string, position: number) => {
    track('search', 'result_clicked', { label: productId, value: position })
  },
  
  aiAsk: (questionLength: number) => {
    track('search', 'ai_ask', { value: questionLength })
  },
}

// ============================================
// Product Events
// ============================================

export const productEvents = {
  view: (productId: string, source: 'search' | 'shelf' | 'trends' | 'direct') => {
    track('product', 'view', { label: productId, metadata: { source } })
  },
  
  scoreLoaded: (productId: string, score: number | null, personalized: boolean) => {
    track('product', 'score_loaded', { 
      label: productId, 
      value: score ?? undefined,
      metadata: { personalized }
    })
  },
  
  ingredientsExpanded: (productId: string) => {
    track('product', 'ingredients_expanded', { label: productId })
  },
  
  aiChatOpened: (productId: string) => {
    track('product', 'ai_chat_opened', { label: productId })
  },
  
  aiQuestionAsked: (productId: string) => {
    track('product', 'ai_question_asked', { label: productId })
  },
}

// ============================================
// Shelf Events
// ============================================

export const shelfEvents = {
  addProduct: (productId: string) => {
    track('shelf', 'add_product', { label: productId })
  },
  
  removeProduct: (productId: string) => {
    track('shelf', 'remove_product', { label: productId })
  },
  
  undoRemove: (productId: string) => {
    track('shelf', 'undo_remove', { label: productId })
  },
  
  undoExpired: (productId: string) => {
    track('shelf', 'undo_expired', { label: productId })
  },
  
  filter: (filterType: string) => {
    track('shelf', 'filter', { label: filterType })
  },
  
  search: (query: string) => {
    track('shelf', 'search', { label: query.slice(0, 50) })
  },
}

// ============================================
// Profile Events
// ============================================

export const profileEvents = {
  view: () => {
    track('profile', 'view')
  },
  
  edit: (field: string) => {
    track('profile', 'edit', { label: field })
  },
  
  surveyStarted: (surveyType: string) => {
    track('profile', 'survey_started', { label: surveyType })
  },
  
  surveyCompleted: (surveyType: string) => {
    track('profile', 'survey_completed', { label: surveyType })
  },
  
  settingsChanged: (setting: string) => {
    track('profile', 'settings_changed', { label: setting })
  },
  
  dataExportRequested: () => {
    track('profile', 'data_export_requested')
  },
  
  accountDeleteRequested: () => {
    track('profile', 'account_delete_requested')
  },
}

// ============================================
// Navigation Events
// ============================================

export const navigationEvents = {
  pageView: (path: string) => {
    track('navigation', 'page_view', { label: path })
  },
  
  tabSwitch: (from: string, to: string) => {
    track('navigation', 'tab_switch', { label: `${from} -> ${to}` })
  },
  
  externalLink: (url: string) => {
    track('navigation', 'external_link', { label: url })
  },
}

// ============================================
// Error Events
// ============================================

export const errorEvents = {
  apiError: (endpoint: string, status: number, message: string) => {
    track('error', 'api_error', { 
      label: endpoint, 
      value: status,
      metadata: { message }
    })
  },
  
  jsError: (error: Error, componentStack?: string) => {
    track('error', 'js_error', { 
      label: error.message.slice(0, 100),
      metadata: { 
        stack: error.stack?.slice(0, 500),
        componentStack: componentStack?.slice(0, 500)
      }
    })
  },
  
  networkError: (url: string) => {
    track('error', 'network_error', { label: url })
  },
}

// ============================================
// LLM Events
// ============================================

export const llmEvents = {
  requestSent: (endpoint: string) => {
    track('llm', 'request_sent', { label: endpoint })
  },
  
  responseReceived: (provider: string, responseTime: number) => {
    track('llm', 'response_received', { label: provider, value: responseTime })
  },
  
  fallbackUsed: (fromProvider: string, toProvider: string) => {
    track('llm', 'fallback_used', { label: `${fromProvider} -> ${toProvider}` })
  },
  
  timeout: (provider: string) => {
    track('llm', 'timeout', { label: provider })
  },
  
  error: (provider: string, error: string) => {
    track('llm', 'error', { label: provider, metadata: { error } })
  },
}

// ============================================
// Initialize & Cleanup
// ============================================

export function initAnalytics(userId?: string): void {
  getSessionId()
  
  if (userId) {
    track('auth', 'session_start', { userId })
  }
  
  // Flush events on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flushEvents)
    
    // Flush events periodically (every 30 seconds)
    setInterval(flushEvents, 30000)
  }
}

export function setUserId(userId: string): void {
  // Update session with user ID
  track('auth', 'user_identified', { userId })
}

// Export all event groups
export const analytics = {
  track,
  auth: authEvents,
  onboarding: onboardingEvents,
  search: searchEvents,
  product: productEvents,
  shelf: shelfEvents,
  profile: profileEvents,
  navigation: navigationEvents,
  error: errorEvents,
  llm: llmEvents,
  init: initAnalytics,
  setUserId,
  flush: flushEvents,

  // ============================================
  // Convenience aliases for common patterns
  // ============================================
  
  // Auth convenience methods
  loginStart: (method: 'email' | 'vk' | 'yandex' | 'telegram' | 'phone' | 'oauth') => {
    track('auth', 'login_start', { label: method })
  },
  loginSuccess: (method: string, userId: string) => {
    track('auth', 'login_success', { label: method, userId })
  },
  loginFailed: (method: string, error: string) => {
    authEvents.loginFailed(method, error)
  },
  registerStart: () => {
    track('auth', 'register_start')
  },
  registerSuccess: (userId: string) => {
    track('auth', 'register_success', { userId })
  },
  registerFailed: (error: string) => {
    track('auth', 'register_failed', { metadata: { error } })
  },
  logout: () => {
    authEvents.logout()
  },
  identify: (user: { id: string; email?: string | null; name?: string; onboardingCompleted?: boolean }) => {
    track('auth', 'identify', { 
      userId: user.id,
      metadata: { email: user.email, name: user.name, onboardingCompleted: user.onboardingCompleted }
    })
  },

  // Product convenience methods
  productView: (productId: string, source: 'search' | 'shelf' | 'trends' | 'direct') => {
    productEvents.view(productId, source)
  },
  scoreViewed: (productId: string, score: number | null, personalized: boolean) => {
    productEvents.scoreLoaded(productId, score, personalized)
  },
  shelfAdd: (productId: string) => {
    shelfEvents.addProduct(productId)
  },

  // Search convenience methods
  searchNoResults: (query: string) => {
    searchEvents.noResults(query)
  },
  searchResultClick: (productId: string, position: number) => {
    searchEvents.resultClicked(productId, position)
  },

  // Shelf convenience methods
  shelfRemove: (productId: string) => {
    shelfEvents.removeProduct(productId)
  },
  shelfUndo: (productId: string) => {
    shelfEvents.undoRemove(productId)
  },

  // Survey convenience methods
  surveyStart: (type: string) => {
    profileEvents.surveyStarted(type)
  },
  surveyComplete: (type: string) => {
    profileEvents.surveyCompleted(type)
  },
  surveySkip: (type: string) => {
    onboardingEvents.skipped(type)
  },

  // Navigation convenience methods
  navClick: (tab: string) => {
    navigationEvents.tabSwitch('current', tab)
  },
  pageView: (path: string) => {
    navigationEvents.pageView(path)
  },

  // Settings convenience methods
  accountDeleteRequest: () => {
    profileEvents.accountDeleteRequested()
  },
  dataExportRequest: () => {
    profileEvents.dataExportRequested()
  },
}

export default analytics
