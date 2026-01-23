import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { ProductAnalysis } from '../llm/llm.types';
import { DEFAULT_SYSTEM_PROMPT } from '../llm/prompts';

export interface ProductWithScore {
  id: string;
  itemId: string | null;
  name: string;
  brand: string | null;
  productType: string | null;
  category: string;
  categoryPath: string | null;
  description: string | null;
  howToUse: string | null;
  inci: string | null;
  ingredients: string[];
  attributes: Record<string, unknown> | null;
  skinType: string | null;
  purpose: string | null;
  imageUrl: string | null;
  imageCount: number | null;
  priceRegular: number | null;
  priceDiscount: number | null;
  discountPercent: number | null;
  inStock: boolean;
  country: string | null;
  brandDescription: string | null;
  // Personalized
  personalScore?: number | null;
  analysis?: ProductAnalysis | null;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * GET /api/products/:id
   * Get product with personalized score
   */
  async getProduct(userId: string, productId: string): Promise<ProductWithScore> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }

    // Get user's system prompt for personalization
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { systemPrompt: true },
    });

    let analysis: ProductAnalysis | null = null;

    // Only calculate personalized score if user has system prompt
    if (user?.systemPrompt) {
      try {
        analysis = await this.llm.analyzeProduct(
          product.id,
          product.name,
          product.brand,
          product.ingredients,
          user.systemPrompt,
        );
      } catch (error) {
        // Log error but don't fail request
        console.error('Failed to get personalized score:', error);
      }
    }

    return {
      ...product,
      attributes: product.attributes as Record<string, unknown> | null,
      personalScore: analysis?.score ?? null,
      analysis,
    };
  }

  /**
   * GET /api/products/:id/score
   * Get only personalized score (faster, for lists)
   */
  async getProductScore(userId: string, productId: string): Promise<{
    score: number | null;
    personalized: boolean;
    pros?: string[];
    cons?: string[];
    recommendation?: string;
  }> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        brand: true,
        ingredients: true,
        score: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }

    // Get user's system prompt
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { systemPrompt: true },
    });

    // Return general score if no personalization
    if (!user?.systemPrompt) {
      return {
        score: product.score,
        personalized: false,
      };
    }

    try {
      const analysis = await this.llm.analyzeProduct(
        product.id,
        product.name,
        product.brand,
        product.ingredients,
        user.systemPrompt,
      );

      return {
        score: analysis.score,
        personalized: true,
        pros: analysis.pros,
        cons: analysis.cons,
        recommendation: analysis.recommendation,
      };
    } catch {
      return {
        score: product.score,
        personalized: false,
      };
    }
  }

  /**
   * GET /api/products/:id/ingredients
   * Get parsed ingredients with safety info
   */
  async getProductIngredients(productId: string): Promise<{
    inci: string | null;
    ingredients: Array<{
      name: string;
      nameRu?: string;
      safety?: string;
      ewgScore?: number;
      functions?: string[];
      description?: string;
    }>;
  }> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        inci: true,
        ingredients: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }

    // Try to match ingredients with our database
    const ingredientDetails = await Promise.all(
      product.ingredients.slice(0, 50).map(async (name) => {
        const matched = await this.prisma.ingredient.findFirst({
          where: {
            OR: [
              { nameInci: { equals: name.toUpperCase(), mode: 'insensitive' } },
              { nameEn: { equals: name, mode: 'insensitive' } },
              { nameRu: { equals: name, mode: 'insensitive' } },
            ],
          },
        });

        if (matched) {
          return {
            name,
            nameRu: matched.nameRu,
            safety: matched.safetyRating,
            ewgScore: matched.ewgScore ?? undefined,
            functions: matched.functions,
            description: matched.description ?? undefined,
          };
        }

        return { name };
      }),
    );

    return {
      inci: product.inci,
      ingredients: ingredientDetails,
    };
  }

  /**
   * POST /api/products/:id/report
   * Report incorrect product info
   */
  async reportProduct(
    userId: string | null,
    productId: string,
    type: string,
    description: string,
  ): Promise<{ ticketId: string }> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }

    const report = await this.prisma.productReport.create({
      data: {
        productId,
        userId,
        type,
        description,
      },
    });

    return { ticketId: report.id };
  }

  /**
   * Ask LLM about specific product
   */
  async askAboutProduct(
    userId: string,
    productId: string,
    question: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  ): Promise<{
    answer: string;
    provider: string;
  }> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { systemPrompt: true },
    });

    const response = await this.llm.askAboutProduct(
      product.id,
      product.name,
      product.brand,
      product.ingredients,
      question,
      user?.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      conversationHistory.map(m => ({
        role: m.role,
        content: m.content,
      })),
    );

    return {
      answer: response.content,
      provider: response.provider,
    };
  }

  /**
   * I-12: Invalidate LLM cache for specific product
   * Called when product data is updated (ingredients, description, etc.)
   */
  async invalidateProductCache(productId: string): Promise<void> {
    try {
      // Get cache store to check for pattern support
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cacheStore = (this.cacheManager as any).store as { 
        keys?: (pattern: string) => Promise<string[]> 
      };

      if (cacheStore.keys) {
        try {
          // Find all cache keys containing this product ID
          const keys = await cacheStore.keys(`llm:product:${productId}:*`);
          for (const key of keys) {
            await this.cacheManager.del(key);
          }
          this.logger.log(`Invalidated ${keys.length} cache entries for product ${productId}`);
        } catch {
          // Pattern-based deletion not supported
          this.logger.debug('Cache store does not support pattern-based deletion');
        }
      }
    } catch (error) {
      this.logger.error(`Failed to invalidate cache for product ${productId}`, error);
    }
  }

  /**
   * Update product and invalidate cache - I-12
   * Used by admin panel or sync jobs
   */
  async updateProduct(
    productId: string, 
    data: Partial<{
      name: string;
      brand: string;
      description: string;
      ingredients: string[];
      inci: string;
      score: number;
    }>
  ): Promise<ProductWithScore> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data,
    });

    // Invalidate cache when product is updated
    await this.invalidateProductCache(productId);
    this.logger.log(`Product ${productId} updated, cache invalidated`);

    return {
      ...updated,
      attributes: updated.attributes as Record<string, unknown> | null,
    };
  }
}
