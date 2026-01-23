import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { GigaChatProvider } from './providers/gigachat.provider';
import { YandexGptProvider } from './providers/yandexgpt.provider';
import {
  LlmMessage,
  LlmCompletionOptions,
  LlmResponse,
  ProductAnalysis,
  ShelfAnalysis,
} from './llm.types';
import * as crypto from 'crypto';

// Context-aware fallback messages - I-11
const FALLBACK_MESSAGES = {
  product: 'К сожалению, персональный анализ продукта временно недоступен. Попробуйте позже или просмотрите общую информацию о составе.',
  shelf: 'Не удалось проанализировать вашу полку. Проверьте добавленные продукты и попробуйте ещё раз.',
  chat: 'AI-ассистент временно недоступен. Попробуйте задать вопрос позже.',
  default: 'Сервис временно недоступен. Попробуйте позже.',
} as const;

type FallbackContext = keyof typeof FALLBACK_MESSAGES;

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly CACHE_TTL = 86400; // 24 hours in seconds
  private readonly LLM_TIMEOUT_MS: number;
  private readonly LLM_MAX_RETRIES: number;

  constructor(
    private readonly gigachat: GigaChatProvider,
    private readonly yandexgpt: YandexGptProvider,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly config: ConfigService,
  ) {
    this.LLM_TIMEOUT_MS = this.config.get<number>('LLM_TIMEOUT_MS') || 15000;
    this.LLM_MAX_RETRIES = this.config.get<number>('LLM_MAX_RETRIES') || 1;
  }

  /**
   * Wrap a promise with timeout - C-4
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operation: string,
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Get context-aware fallback message - I-11
   */
  private getFallbackMessage(context: FallbackContext = 'default'): string {
    return FALLBACK_MESSAGES[context] || FALLBACK_MESSAGES.default;
  }

  /**
   * Complete chat with fallback strategy and timeout - C-4
   * 1. Try GigaChat (primary) with timeout + 1 retry
   * 2. Fallback to YandexGPT with timeout + 1 retry
   * 3. Return context-aware fallback response
   */
  async complete(
    messages: LlmMessage[],
    options: LlmCompletionOptions = {},
    context: FallbackContext = 'default',
  ): Promise<LlmResponse> {
    // Try GigaChat first with retry - edge-llm-retry
    let gigachatAttempts = 0;
    while (gigachatAttempts <= this.LLM_MAX_RETRIES) {
      try {
        if (await this.gigachat.isAvailable()) {
          this.logger.debug(`Attempting GigaChat completion (attempt ${gigachatAttempts + 1})`);
          const response = await this.withTimeout(
            this.gigachat.complete(messages, options),
            this.LLM_TIMEOUT_MS,
            'GigaChat',
          );
          return response;
        }
        break; // Not available, skip to fallback
      } catch (error) {
        const isTimeout = error instanceof Error && error.message.includes('timed out');
        gigachatAttempts++;
        
        if (isTimeout && gigachatAttempts <= this.LLM_MAX_RETRIES) {
          this.logger.warn(`GigaChat timed out, retrying (${gigachatAttempts}/${this.LLM_MAX_RETRIES})`);
          continue;
        }
        
        this.logger.warn('GigaChat failed, trying fallback', error);
        break;
      }
    }

    // Fallback to YandexGPT with retry
    let yandexAttempts = 0;
    while (yandexAttempts <= this.LLM_MAX_RETRIES) {
      try {
        if (await this.yandexgpt.isAvailable()) {
          this.logger.debug(`Attempting YandexGPT completion (attempt ${yandexAttempts + 1})`);
          const response = await this.withTimeout(
            this.yandexgpt.complete(messages, options),
            this.LLM_TIMEOUT_MS,
            'YandexGPT',
          );
          return response;
        }
        break; // Not available
      } catch (error) {
        const isTimeout = error instanceof Error && error.message.includes('timed out');
        yandexAttempts++;
        
        if (isTimeout && yandexAttempts <= this.LLM_MAX_RETRIES) {
          this.logger.warn(`YandexGPT timed out, retrying (${yandexAttempts}/${this.LLM_MAX_RETRIES})`);
          continue;
        }
        
        this.logger.warn('YandexGPT failed', error);
        break;
      }
    }

    // Return context-aware fallback response - I-11
    this.logger.error('All LLM providers failed, returning fallback');
    return {
      content: this.getFallbackMessage(context),
      provider: 'fallback',
    };
  }

  /**
   * Analyze product for user with caching
   */
  async analyzeProduct(
    productId: string,
    productName: string,
    productBrand: string | null,
    productIngredients: string[],
    userSystemPrompt: string,
  ): Promise<ProductAnalysis> {
    // Generate cache key
    const cacheKey = this.generateCacheKey('product', productId, userSystemPrompt);

    // Check cache
    const cached = await this.cacheManager.get<ProductAnalysis>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for product ${productId}`);
      return cached;
    }

    const messages: LlmMessage[] = [
      {
        role: 'system',
        content: `${userSystemPrompt}

Твоя задача - проанализировать косметический продукт и дать персональную оценку от 0 до 100.

ВАЖНО: Ответ должен быть в JSON формате:
{
  "score": число от 0 до 100,
  "pros": ["плюс 1", "плюс 2"],
  "cons": ["минус 1", "минус 2"],
  "recommendation": "краткая рекомендация",
  "compatibilityWarnings": ["предупреждение 1"] // опционально
}`,
      },
      {
        role: 'user',
        content: `Проанализируй продукт:
Название: ${productName}
Бренд: ${productBrand || 'Не указан'}
Состав (INCI): ${productIngredients.slice(0, 30).join(', ')}${productIngredients.length > 30 ? '...' : ''}`,
      },
    ];

    const response = await this.complete(
      messages,
      { temperature: 0.3, maxTokens: 1000 },
      'product',
    );

    let analysis: ProductAnalysis;

    try {
      // Parse JSON response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      this.logger.warn('Failed to parse LLM response, using defaults');
      analysis = {
        score: 70,
        pros: ['Информация о плюсах недоступна'],
        cons: ['Информация о минусах недоступна'],
        recommendation: response.content.slice(0, 200),
      };
    }

    // Validate and clamp score
    analysis.score = Math.max(0, Math.min(100, analysis.score));

    // Cache result
    await this.cacheManager.set(cacheKey, analysis, this.CACHE_TTL);

    return analysis;
  }

  /**
   * Analyze user's shelf (products collection)
   */
  async analyzeShelf(
    products: Array<{
      id: string;
      name: string;
      brand: string | null;
      ingredients: string[];
    }>,
    userSystemPrompt: string,
  ): Promise<ShelfAnalysis> {
    const cacheKey = this.generateCacheKey(
      'shelf',
      products.map(p => p.id).join('-'),
      userSystemPrompt,
    );

    const cached = await this.cacheManager.get<ShelfAnalysis>(cacheKey);
    if (cached) {
      return cached;
    }

    const productsList = products
      .map(p => `- ${p.name} (${p.brand || 'Бренд не указан'})`)
      .join('\n');

    const messages: LlmMessage[] = [
      {
        role: 'system',
        content: `${userSystemPrompt}

Проанализируй косметическую полку пользователя. Оцени совместимость продуктов и дай рекомендации.

ВАЖНО: Ответ должен быть в JSON формате:
{
  "overallScore": число от 0 до 100,
  "recommendation": "общая рекомендация",
  "conflicts": [{"products": ["название 1", "название 2"], "reason": "причина конфликта"}],
  "synergies": [{"products": ["название 1", "название 2"], "benefit": "польза"}],
  "suggestions": [{"type": "add|replace|remove", "product": "название", "reason": "причина"}]
}`,
      },
      {
        role: 'user',
        content: `Моя косметическая полка:\n${productsList}`,
      },
    ];

    const response = await this.complete(
      messages,
      { temperature: 0.3, maxTokens: 1500 },
      'shelf',
    );

    let analysis: ShelfAnalysis;

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      analysis = {
        overallScore: 75,
        recommendation: response.content.slice(0, 300),
        conflicts: [],
        synergies: [],
        suggestions: [],
      };
    }

    analysis.overallScore = Math.max(0, Math.min(100, analysis.overallScore));

    await this.cacheManager.set(cacheKey, analysis, this.CACHE_TTL);

    return analysis;
  }

  /**
   * Ask LLM about product (free-form chat)
   */
  async askAboutProduct(
    productId: string,
    productName: string,
    productBrand: string | null,
    productIngredients: string[],
    userQuestion: string,
    userSystemPrompt: string,
    conversationHistory: LlmMessage[] = [],
  ): Promise<LlmResponse> {
    const systemMessage: LlmMessage = {
      role: 'system',
      content: `${userSystemPrompt}

Ты отвечаешь на вопросы пользователя о косметическом продукте.
Продукт: ${productName}
Бренд: ${productBrand || 'Не указан'}
Состав: ${productIngredients.slice(0, 20).join(', ')}

Давай точные, персонализированные ответы на основе профиля пользователя.
Если не уверен - так и скажи. Не выдумывай информацию.`,
    };

    const messages: LlmMessage[] = [
      systemMessage,
      ...conversationHistory,
      {
        role: 'user',
        content: userQuestion,
      },
    ];

    return this.complete(
      messages,
      { temperature: 0.7, maxTokens: 1000 },
      'chat',
    );
  }

  /**
   * Invalidate cache for user (when profile changes)
   */
  async invalidateUserCache(userId: string): Promise<void> {
    // Note: In production, you'd want to store cache keys per user
    // For now, we'll just log the invalidation request
    this.logger.log(`Cache invalidation requested for user ${userId}`);
    // In Redis implementation, you'd use: KEYS product:*:${userId}:* and delete
  }

  /**
   * Generate deterministic cache key
   */
  private generateCacheKey(
    type: string,
    itemId: string,
    systemPrompt: string,
  ): string {
    // Hash the system prompt to avoid long keys
    const promptHash = crypto
      .createHash('md5')
      .update(systemPrompt)
      .digest('hex')
      .slice(0, 8);

    return `llm:${type}:${itemId}:${promptHash}`;
  }
}
