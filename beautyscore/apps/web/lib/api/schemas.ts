/**
 * Zod schemas for API response validation
 * Ensures type safety at runtime
 */

import { z } from 'zod'

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email().nullable(),
  emailVerified: z.string().datetime().nullable().optional(),
  phone: z.string().nullable().optional(),
  phoneVerified: z.string().datetime().nullable().optional(),
  name: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  skinType: z.enum(['DRY', 'OILY', 'COMBINATION', 'NORMAL', 'SENSITIVE']).nullable().optional(),
  hairType: z.enum(['STRAIGHT', 'WAVY', 'CURLY', 'COILY', 'THIN', 'THICK', 'DAMAGED', 'COLORED']).nullable().optional(),
  skinProblems: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  vkId: z.string().nullable().optional(),
  yandexId: z.string().nullable().optional(),
  telegramId: z.string().nullable().optional(),
  notificationsEnabled: z.boolean().optional(),
  marketingEnabled: z.boolean().optional(),
  onboardingCompleted: z.boolean().optional(),
  level: z.number().optional(),
  scansCount: z.number().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type User = z.infer<typeof userSchema>

// Auth response schemas
export const authResponseSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
})

export type AuthResponse = z.infer<typeof authResponseSchema>

export const refreshResponseSchema = z.object({
  accessToken: z.string(),
})

export type RefreshResponse = z.infer<typeof refreshResponseSchema>

// Product schemas
export const productCategorySchema = z.enum([
  'SKINCARE',
  'HAIRCARE',
  'MAKEUP',
  'BODY',
  'SUNCARE',
  'FRAGRANCE',
  'OTHER',
])

export const productSchema = z.object({
  id: z.string(),
  barcode: z.string().nullable().optional(),
  name: z.string(),
  brand: z.string().nullable().optional(),
  category: productCategorySchema,
  score: z.number().nullable().optional(),
  ingredients: z.array(z.string()).optional(),
  analyzedIngredients: z.unknown().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Product = z.infer<typeof productSchema>

// Ingredient schemas
export const safetyRatingSchema = z.enum([
  'SAFE',
  'GENERALLY_SAFE',
  'MODERATE_CONCERN',
  'HIGH_CONCERN',
  'AVOID',
])

export const ingredientSchema = z.object({
  id: z.string(),
  nameRu: z.string(),
  nameEn: z.string().nullable().optional(),
  nameInci: z.string().nullable().optional(),
  aliases: z.array(z.string()).optional(),
  safetyRating: safetyRatingSchema,
  ewgScore: z.number().nullable().optional(),
  category: z.string(),
  functions: z.array(z.string()).optional(),
  concerns: z.array(z.string()).optional(),
  description: z.string().nullable().optional(),
})

export type Ingredient = z.infer<typeof ingredientSchema>

// Error response
export const errorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  error: z.string().optional(),
})

export type ErrorResponse = z.infer<typeof errorResponseSchema>

// Validate API response helper
export function validateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { 
    success: false, 
    error: result.error.issues.map((e) => e.message).join(', ') 
  }
}
