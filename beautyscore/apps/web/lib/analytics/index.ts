/**
 * BeautyScore Analytics Service
 * Unified analytics interface for tracking user behavior
 * 
 * Supports: PostHog, Yandex Metrika (configurable)
 */

// Event categories
export const EventCategory = {
  AUTH: 'auth',
  NAVIGATION: 'navigation',
  PRODUCT: 'product',
  SEARCH: 'search',
  SHELF: 'shelf',
  SURVEY: 'survey',
  PROFILE: 'profile',
  LLM: 'llm',
} as const

// Event types
export const AnalyticsEvent = {
  // Auth events
  LOGIN_START: 'login_start',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  REGISTER_START: 'register_start',
  REGISTER_SUCCESS: 'register_success',
  REGISTER_FAILED: 'register_failed',
  LOGOUT: 'logout',
  OAUTH_START: 'oauth_start',
  OAUTH_SUCCESS: 'oauth_success',
  PASSWORD_RESET_REQUEST: 'password_reset_request',
  
  // Navigation events
  PAGE_VIEW: 'page_view',
  NAV_CLICK: 'nav_click',
  
  // Product events
  PRODUCT_VIEW: 'product_view',
  PRODUCT_SCORE_VIEWED: 'product_score_viewed',
  PRODUCT_INGREDIENTS_VIEWED: 'product_ingredients_viewed',
  
  // Search events
  SEARCH_PERFORMED: 'search_performed',
  SEARCH_RESULT_CLICKED: 'search_result_clicked',
  SEARCH_NO_RESULTS: 'search_no_results',
  
  // Shelf events
  SHELF_ADD: 'shelf_add',
  SHELF_REMOVE: 'shelf_remove',
  SHELF_UNDO: 'shelf_undo',
  
  // Survey events
  SURVEY_START: 'survey_start',
  SURVEY_COMPLETE: 'survey_complete',
  SURVEY_SKIP: 'survey_skip',
  
  // Profile events
  PROFILE_UPDATE: 'profile_update',
  DATA_EXPORT_REQUEST: 'data_export_request',
  ACCOUNT_DELETE_REQUEST: 'account_delete_request',
  
  // LLM events
  LLM_REQUEST: 'llm_request',
  LLM_SUCCESS: 'llm_success',
  LLM_FALLBACK: 'llm_fallback',
  LLM_ERROR: 'llm_error',
} as const

export type EventName = typeof AnalyticsEvent[keyof typeof AnalyticsEvent]

interface AnalyticsProperties {
  [key: string]: string | number | boolean | null | undefined
}

interface AnalyticsUser {
  id: string
  email?: string
  name?: string
  onboardingCompleted?: boolean
  createdAt?: string
}

// Check if analytics is enabled
const isAnalyticsEnabled = (): boolean => {
  if (typeof window === 'undefined') return false
  return process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true'
}

// PostHog integration
const getPostHog = () => {
  if (typeof window === 'undefined') return null
  // @ts-expect-error - PostHog is loaded dynamically
  return window.posthog || null
}

// Yandex Metrika integration
const getYM = () => {
  if (typeof window === 'undefined') return null
  // @ts-expect-error - ym is loaded dynamically
  return window.ym || null
}

const YANDEX_METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID

/**
 * Track an analytics event
 */
export function track(event: EventName, properties?: AnalyticsProperties): void {
  if (!isAnalyticsEnabled()) {
    // In development, log events to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${event}`, properties)
    }
    return
  }

  try {
    // PostHog
    const posthog = getPostHog()
    if (posthog) {
      posthog.capture(event, properties)
    }

    // Yandex Metrika
    const ym = getYM()
    if (ym && YANDEX_METRIKA_ID) {
      ym(YANDEX_METRIKA_ID, 'reachGoal', event, properties)
    }
  } catch (error) {
    console.error('[Analytics] Track error:', error)
  }
}

/**
 * Identify a user for analytics
 */
export function identify(user: AnalyticsUser): void {
  if (!isAnalyticsEnabled()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Identify:', user)
    }
    return
  }

  try {
    // PostHog
    const posthog = getPostHog()
    if (posthog) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
        onboarding_completed: user.onboardingCompleted,
        created_at: user.createdAt,
      })
    }

    // Yandex Metrika
    const ym = getYM()
    if (ym && YANDEX_METRIKA_ID) {
      ym(YANDEX_METRIKA_ID, 'userParams', {
        UserID: user.id,
      })
    }
  } catch (error) {
    console.error('[Analytics] Identify error:', error)
  }
}

/**
 * Reset analytics (on logout)
 */
export function reset(): void {
  if (!isAnalyticsEnabled()) return

  try {
    const posthog = getPostHog()
    if (posthog) {
      posthog.reset()
    }
  } catch (error) {
    console.error('[Analytics] Reset error:', error)
  }
}

/**
 * Track page view
 */
export function pageView(path: string, title?: string): void {
  track(AnalyticsEvent.PAGE_VIEW, {
    path,
    title: title || document.title,
    referrer: document.referrer || null,
  })
}

// Convenience functions for common events

export const analytics = {
  // Auth
  loginStart: (method: 'email' | 'oauth') => 
    track(AnalyticsEvent.LOGIN_START, { method }),
  
  loginSuccess: (method: 'email' | 'oauth', userId: string) => 
    track(AnalyticsEvent.LOGIN_SUCCESS, { method, user_id: userId }),
  
  loginFailed: (method: 'email' | 'oauth', error: string) => 
    track(AnalyticsEvent.LOGIN_FAILED, { method, error }),
  
  registerStart: () => 
    track(AnalyticsEvent.REGISTER_START),
  
  registerSuccess: (userId: string) => 
    track(AnalyticsEvent.REGISTER_SUCCESS, { user_id: userId }),
  
  registerFailed: (error: string) => 
    track(AnalyticsEvent.REGISTER_FAILED, { error }),
  
  logout: () => {
    track(AnalyticsEvent.LOGOUT)
    reset()
  },
  
  oauthStart: (provider: string) => 
    track(AnalyticsEvent.OAUTH_START, { provider }),
  
  oauthSuccess: (provider: string, userId: string) => 
    track(AnalyticsEvent.OAUTH_SUCCESS, { provider, user_id: userId }),

  // Navigation
  navClick: (destination: string, source: string) => 
    track(AnalyticsEvent.NAV_CLICK, { destination, source }),

  // Product
  productView: (productId: string, productName: string, category: string) => 
    track(AnalyticsEvent.PRODUCT_VIEW, { 
      product_id: productId, 
      product_name: productName,
      category,
    }),
  
  scoreViewed: (productId: string, score: number, isPersonalized: boolean) => 
    track(AnalyticsEvent.PRODUCT_SCORE_VIEWED, { 
      product_id: productId, 
      score,
      is_personalized: isPersonalized,
    }),
  
  ingredientsViewed: (productId: string) => 
    track(AnalyticsEvent.PRODUCT_INGREDIENTS_VIEWED, { product_id: productId }),

  // Search
  search: (query: string, resultsCount: number) => 
    track(AnalyticsEvent.SEARCH_PERFORMED, { 
      query, 
      query_length: query.length,
      results_count: resultsCount,
    }),
  
  searchResultClick: (query: string, productId: string, position: number) => 
    track(AnalyticsEvent.SEARCH_RESULT_CLICKED, { 
      query, 
      product_id: productId,
      position,
    }),
  
  searchNoResults: (query: string) => 
    track(AnalyticsEvent.SEARCH_NO_RESULTS, { query }),

  // Shelf
  shelfAdd: (productId: string, productName: string) => 
    track(AnalyticsEvent.SHELF_ADD, { 
      product_id: productId,
      product_name: productName,
    }),
  
  shelfRemove: (productId: string) => 
    track(AnalyticsEvent.SHELF_REMOVE, { product_id: productId }),
  
  shelfUndo: (productId: string) => 
    track(AnalyticsEvent.SHELF_UNDO, { product_id: productId }),

  // Survey
  surveyStart: (surveyType: string) => 
    track(AnalyticsEvent.SURVEY_START, { survey_type: surveyType }),
  
  surveyComplete: (surveyType: string, duration: number) => 
    track(AnalyticsEvent.SURVEY_COMPLETE, { 
      survey_type: surveyType,
      duration_seconds: duration,
    }),
  
  surveySkip: (surveyType: string) => 
    track(AnalyticsEvent.SURVEY_SKIP, { survey_type: surveyType }),

  // Profile
  profileUpdate: (fields: string[]) => 
    track(AnalyticsEvent.PROFILE_UPDATE, { updated_fields: fields.join(',') }),
  
  dataExportRequest: () => 
    track(AnalyticsEvent.DATA_EXPORT_REQUEST),
  
  accountDeleteRequest: () => 
    track(AnalyticsEvent.ACCOUNT_DELETE_REQUEST),

  // LLM
  llmRequest: (context: string) => 
    track(AnalyticsEvent.LLM_REQUEST, { context }),
  
  llmSuccess: (context: string, provider: string, durationMs: number) => 
    track(AnalyticsEvent.LLM_SUCCESS, { 
      context, 
      provider,
      duration_ms: durationMs,
    }),
  
  llmFallback: (context: string, primaryProvider: string, fallbackProvider: string) => 
    track(AnalyticsEvent.LLM_FALLBACK, { 
      context,
      primary_provider: primaryProvider,
      fallback_provider: fallbackProvider,
    }),
  
  llmError: (context: string, error: string) => 
    track(AnalyticsEvent.LLM_ERROR, { context, error }),

  // Core
  track,
  identify,
  reset,
  pageView,
}

export default analytics
