import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { SurveysService } from '../surveys/surveys.service';
import { ProductCategory, Prisma } from '@prisma/client';

export interface SearchQuery {
  q: string;
  category?: ProductCategory;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  skinType?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  products: Array<{
    id: string;
    name: string;
    brand: string | null;
    productType: string | null;
    imageUrl: string | null;
    priceRegular: number | null;
    priceDiscount: number | null;
    score: number | null; // General score
    personalScore?: number | null; // Personalized score
  }>;
  total: number;
  page: number;
  hasMore: boolean;
}

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly surveys: SurveysService,
  ) {}

  /**
   * GET /api/search - Personalized product search
   */
  async search(userId: string, query: SearchQuery): Promise<SearchResult> {
    const { q, category, brand, minPrice, maxPrice, skinType, page = 1, limit = 20 } = query;

    if (!q || q.length < 2) {
      throw new BadRequestException('Минимум 2 символа для поиска');
    }

    // Sanitize query (remove special chars)
    const sanitized = q.slice(0, 500).replace(/[^\wа-яА-ЯёЁ\s-]/g, '');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      OR: [
        { name: { contains: sanitized, mode: 'insensitive' } },
        { brand: { contains: sanitized, mode: 'insensitive' } },
        { productType: { contains: sanitized, mode: 'insensitive' } },
        { categoryPath: { contains: sanitized, mode: 'insensitive' } },
      ],
    };

    if (category) where.category = category;
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (skinType) where.skinType = { contains: skinType, mode: 'insensitive' };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.priceRegular = {};
      if (minPrice !== undefined) where.priceRegular.gte = minPrice;
      if (maxPrice !== undefined) where.priceRegular.lte = maxPrice;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          brand: true,
          productType: true,
          imageUrl: true,
          priceRegular: true,
          priceDiscount: true,
          score: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Save search history
    await this.saveSearchHistory(userId, sanitized, 'text');

    return {
      products: products.map(p => ({
        ...p,
        personalScore: null, // Will be calculated on product detail
      })),
      total,
      page,
      hasMore: skip + products.length < total,
    };
  }

  /**
   * GET /api/search/suggestions - Autocomplete suggestions
   */
  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const sanitized = query.slice(0, 100).replace(/[^\wа-яА-ЯёЁ\s-]/g, '');

    // Get product names matching query
    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: sanitized, mode: 'insensitive' } },
          { brand: { contains: sanitized, mode: 'insensitive' } },
        ],
      },
      select: { name: true, brand: true },
      take: 10,
      distinct: ['name'],
    });

    // Get ingredient names
    const ingredients = await this.prisma.ingredient.findMany({
      where: {
        OR: [
          { nameRu: { contains: sanitized, mode: 'insensitive' } },
          { nameEn: { contains: sanitized, mode: 'insensitive' } },
        ],
      },
      select: { nameRu: true },
      take: 5,
    });

    const suggestions: string[] = [];

    products.forEach(p => {
      if (p.brand && !suggestions.includes(p.brand)) {
        suggestions.push(p.brand);
      }
      if (!suggestions.includes(p.name)) {
        suggestions.push(p.name);
      }
    });

    ingredients.forEach(i => {
      if (!suggestions.includes(i.nameRu)) {
        suggestions.push(i.nameRu);
      }
    });

    return suggestions.slice(0, 10);
  }

  /**
   * GET /api/search/popular - Popular searches
   */
  async getPopularSearches(): Promise<string[]> {
    // Get most common search queries from history
    const popular = await this.prisma.searchHistory.groupBy({
      by: ['query'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    return popular.map(p => p.query);
  }

  /**
   * POST /api/search/ask - LLM-powered search
   */
  async askLlm(userId: string, question: string): Promise<{
    answer: string;
    products: Array<{
      id: string;
      name: string;
      brand: string | null;
      imageUrl: string | null;
    }>;
    provider: string;
  }> {
    if (!question || question.length < 5) {
      throw new BadRequestException('Слишком короткий вопрос');
    }

    if (question.length > 500) {
      question = question.slice(0, 500);
    }

    // Check if user has completed surveys
    const surveyStatus = await this.surveys.hasCompletedSurveys(userId);

    // Get user's system prompt
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { systemPrompt: true },
    });

    const systemPrompt = user?.systemPrompt || `Ты — консультант по косметике.
Отвечай на вопросы кратко и по делу.
Рекомендуй конкретные продукты если это уместно.
${surveyStatus.any ? '' : 'Предложи пройти опросы для персональных рекомендаций.'}`;

    const response = await this.llm.complete(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      { temperature: 0.7, maxTokens: 1000 },
    );

    // Save to history
    await this.saveSearchHistory(userId, question, 'llm');

    // Try to find mentioned products
    const products = await this.findMentionedProducts(response.content);

    return {
      answer: response.content,
      products,
      provider: response.provider,
    };
  }

  /**
   * GET /api/search/history - User's search history
   */
  async getHistory(userId: string, limit = 20): Promise<Array<{
    id: string;
    query: string;
    type: string;
    createdAt: Date;
  }>> {
    return this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        query: true,
        type: true,
        createdAt: true,
      },
    });
  }

  /**
   * DELETE /api/search/history - Clear all history
   */
  async clearHistory(userId: string): Promise<void> {
    await this.prisma.searchHistory.deleteMany({
      where: { userId },
    });
  }

  /**
   * DELETE /api/search/history/:id - Delete single history item
   */
  async deleteHistoryItem(userId: string, historyId: string): Promise<void> {
    await this.prisma.searchHistory.deleteMany({
      where: { id: historyId, userId },
    });
  }

  // Private helpers

  private async saveSearchHistory(
    userId: string,
    query: string,
    type: string,
  ): Promise<void> {
    try {
      await this.prisma.searchHistory.create({
        data: { userId, query, type },
      });
    } catch {
      // Ignore errors for history saving
    }
  }

  private async findMentionedProducts(
    text: string,
  ): Promise<Array<{ id: string; name: string; brand: string | null; imageUrl: string | null }>> {
    // Simple implementation: find products whose names are mentioned in text
    const products = await this.prisma.product.findMany({
      take: 100,
      select: { id: true, name: true, brand: true, imageUrl: true },
    });

    const mentioned = products.filter(
      p => text.toLowerCase().includes(p.name.toLowerCase()) ||
           (p.brand && text.toLowerCase().includes(p.brand.toLowerCase()))
    );

    return mentioned.slice(0, 5);
  }
}
