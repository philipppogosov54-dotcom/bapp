/**
 * LLM Types for BeautyScore
 * Defines interfaces for LLM providers and responses
 */

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LlmResponse {
  content: string;
  provider: 'gigachat' | 'yandexgpt' | 'fallback';
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cached?: boolean;
}

export interface ProductAnalysis {
  score: number; // 0-100
  pros: string[];
  cons: string[];
  recommendation: string;
  compatibilityWarnings?: string[];
}

export interface ShelfAnalysis {
  overallScore: number; // 0-100
  recommendation: string;
  conflicts: Array<{
    products: string[];
    reason: string;
  }>;
  synergies: Array<{
    products: string[];
    benefit: string;
  }>;
  suggestions: Array<{
    type: 'add' | 'replace' | 'remove';
    product?: string;
    reason: string;
  }>;
}

export interface LlmProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  complete(
    messages: LlmMessage[],
    options?: LlmCompletionOptions,
  ): Promise<LlmResponse>;
}
