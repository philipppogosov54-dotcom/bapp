export { api, apiRequest, API_URL, ApiError, setAccessToken, getAccessToken, clearAccessToken } from './client'

// Schemas - validation types
export { 
  userSchema, 
  authResponseSchema, 
  refreshResponseSchema,
  productCategorySchema,
  productSchema,
  safetyRatingSchema,
  ingredientSchema,
  errorResponseSchema,
  validateResponse,
} from './schemas'
export type { 
  User, 
  AuthResponse, 
  RefreshResponse,
  // Renamed to avoid conflict with hooks.ts Product
  Product as ProductSchema,
  Ingredient,
  ErrorResponse,
} from './schemas'

// Hooks - React data fetching
export {
  useShelf,
  useProduct,
  useSearch,
  useTrends,
  useLlmChat,
  useAskAI,
  useProfile,
  useShelfAnalysis,
  useSearchHistory,
  useNotifications,
} from './hooks'
export type {
  ShelfItem,
  Product,
  ProductScore,
  SearchResult,
  TrendItem,
  ShelfAnalysis,
  SearchHistoryItem,
  NotificationItem,
} from './hooks'