/**
 * Secure API Client
 * - Uses environment variables for API URL
 * - Stores access token in memory (not localStorage - XSS safe)
 * - Automatic token refresh on 401
 * - Request/Response interceptors
 * - Request deduplication for GET requests
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Token storage in memory (XSS-safe)
let accessToken: string | null = null

// Request deduplication cache for GET requests
// Prevents duplicate requests when user clicks multiple times
const pendingRequests = new Map<string, Promise<unknown>>()

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

export function clearAccessToken() {
  accessToken = null
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Send httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    if (data.accessToken) {
      setAccessToken(data.accessToken)
      return data.accessToken
    }
    return null
  } catch {
    return null
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { skipAuth = false, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  }

  // Add Authorization header if we have a token and auth is not skipped
  if (!skipAuth && accessToken) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`

  try {
    let response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Always send cookies for refresh token
    })

    // If 401 and not a refresh request, try to refresh token
    if (response.status === 401 && !endpoint.includes('/auth/refresh') && !skipAuth) {
      const newToken = await refreshAccessToken()
      
      if (newToken) {
        // Retry original request with new token
        ;(headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`
        response = await fetch(url, {
          ...fetchOptions,
          headers,
          credentials: 'include',
        })
      }
    }

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        data: null,
        error: data?.message || `HTTP Error ${response.status}`,
        status: response.status,
      }
    }

    return {
      data: data as T,
      error: null,
      status: response.status,
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    }
  }
}

// Helper to extract data or throw error
async function unwrapResponse<T>(promise: Promise<ApiResponse<T>>): Promise<T> {
  const response = await promise
  if (response.error || !response.data) {
    throw new ApiError(response.status, response.error || 'Unknown error')
  }
  return response.data
}

// Request deduplication wrapper for GET requests
// Returns existing promise if same request is in-flight
async function deduplicatedGet<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  const cacheKey = `GET:${endpoint}`
  
  // Check if request is already in-flight
  const pending = pendingRequests.get(cacheKey)
  if (pending) {
    return pending as Promise<T>
  }
  
  // Create new request
  const requestPromise = unwrapResponse(apiRequest<T>(endpoint, { ...options, method: 'GET' }))
    .finally(() => {
      // Clean up after request completes
      pendingRequests.delete(cacheKey)
    })
  
  // Store in pending requests
  pendingRequests.set(cacheKey, requestPromise)
  
  return requestPromise
}

// Convenience methods - throw errors, return data directly
export const api = {
  // GET with request deduplication
  get: <T>(endpoint: string, options?: RequestOptions): Promise<T> =>
    deduplicatedGet<T>(endpoint, options),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    unwrapResponse(apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    unwrapResponse(apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    unwrapResponse(apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })),

  delete: <T>(endpoint: string, options?: RequestOptions): Promise<T> =>
    unwrapResponse(apiRequest<T>(endpoint, { ...options, method: 'DELETE' })),
  
  // Raw version that returns ApiResponse (useful when you need error details)
  raw: {
    get: <T>(endpoint: string, options?: RequestOptions) =>
      apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
      apiRequest<T>(endpoint, {
        ...options,
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      }),
  },
  
  // Clear pending requests (useful for testing or cleanup)
  clearPendingRequests: () => {
    pendingRequests.clear()
  },
}

export { API_URL, ApiError }
