import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { ProductStatus } from '@prisma/client';
import { ShelfAnalysis } from '../llm/llm.types';

// Время для undo операции (по PRD - 30 секунд)
const UNDO_TIMEOUT_MS = 30 * 1000;

export interface ShelfItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    brand: string | null;
    imageUrl: string | null;
    category: string;
  };
  /** True if the product was deleted from the database */
  isUnavailable?: boolean;
  status: ProductStatus;
  notes: string | null;
  rating: number | null;
  openedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
}

export interface AddToShelfDto {
  productId: string;
  status?: ProductStatus;
  notes?: string;
}

export interface UpdateShelfItemDto {
  status?: ProductStatus;
  notes?: string;
  rating?: number;
  openedAt?: Date | string;
  finishedAt?: Date | string;
}

@Injectable()
export class ShelfService {
  private readonly logger = new Logger(ShelfService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
  ) {}

  /**
   * GET /api/shelf - Get user's shelf
   * Handles case where product was deleted from database (isUnavailable flag)
   */
  async getShelf(userId: string, status?: ProductStatus): Promise<ShelfItem[]> {
    const where: { userId: string; status?: ProductStatus } = { userId };
    if (status) where.status = status;

    const items = await this.prisma.userProduct.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            imageUrl: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map(item => {
      // Handle case where product was deleted from database
      const isUnavailable = !item.product;
      const product = item.product || {
        id: item.productId,
        name: 'Товар удалён',
        brand: null,
        imageUrl: null,
        category: 'Недоступно',
      };

      return {
        id: item.id,
        productId: item.productId,
        product,
        isUnavailable,
        status: item.status,
        notes: item.notes,
        rating: item.rating,
        openedAt: item.openedAt,
        finishedAt: item.finishedAt,
        createdAt: item.createdAt,
      };
    });
  }

  /**
   * POST /api/shelf - Add product to shelf
   */
  async addToShelf(userId: string, dto: AddToShelfDto): Promise<ShelfItem> {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }

    // Check if already on shelf
    const existing = await this.prisma.userProduct.findUnique({
      where: { userId_productId: { userId, productId: dto.productId } },
    });

    if (existing) {
      throw new BadRequestException('Продукт уже на полке');
    }

    const item = await this.prisma.userProduct.create({
      data: {
        userId,
        productId: dto.productId,
        status: dto.status || 'ACTIVE',
        notes: dto.notes,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            imageUrl: true,
            category: true,
          },
        },
      },
    });

    return {
      id: item.id,
      productId: item.productId,
      product: item.product,
      status: item.status,
      notes: item.notes,
      rating: item.rating,
      openedAt: item.openedAt,
      finishedAt: item.finishedAt,
      createdAt: item.createdAt,
    };
  }

  /**
   * GET /api/shelf/:itemId - Get single shelf item
   * Handles case where product was deleted from database
   */
  async getShelfItem(userId: string, itemId: string): Promise<ShelfItem> {
    const item = await this.prisma.userProduct.findFirst({
      where: { id: itemId, userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            imageUrl: true,
            category: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Товар не найден на полке');
    }

    // Handle case where product was deleted from database
    const isUnavailable = !item.product;
    const product = item.product || {
      id: item.productId,
      name: 'Товар удалён',
      brand: null,
      imageUrl: null,
      category: 'Недоступно',
    };

    return {
      id: item.id,
      productId: item.productId,
      product,
      isUnavailable,
      status: item.status,
      notes: item.notes,
      rating: item.rating,
      openedAt: item.openedAt,
      finishedAt: item.finishedAt,
      createdAt: item.createdAt,
    };
  }

  /**
   * PUT /api/shelf/:itemId - Update shelf item
   */
  async updateShelfItem(
    userId: string,
    itemId: string,
    dto: UpdateShelfItemDto,
  ): Promise<ShelfItem> {
    const existing = await this.prisma.userProduct.findFirst({
      where: { id: itemId, userId },
    });

    if (!existing) {
      throw new NotFoundException('Товар не найден на полке');
    }

    // Validate rating
    if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
      throw new BadRequestException('Рейтинг должен быть от 1 до 5');
    }

    const item = await this.prisma.userProduct.update({
      where: { id: itemId },
      data: {
        status: dto.status,
        notes: dto.notes,
        rating: dto.rating,
        openedAt: dto.openedAt ? new Date(dto.openedAt) : undefined,
        finishedAt: dto.finishedAt ? new Date(dto.finishedAt) : undefined,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            imageUrl: true,
            category: true,
          },
        },
      },
    });

    // Handle case where product was deleted from database
    const isUnavailable = !item.product;
    const product = item.product || {
      id: item.productId,
      name: 'Товар удалён',
      brand: null,
      imageUrl: null,
      category: 'Недоступно',
    };

    return {
      id: item.id,
      productId: item.productId,
      product,
      isUnavailable,
      status: item.status,
      notes: item.notes,
      rating: item.rating,
      openedAt: item.openedAt,
      finishedAt: item.finishedAt,
      createdAt: item.createdAt,
    };
  }

  /**
   * DELETE /api/shelf/:itemId - Remove from shelf (soft delete)
   * User has 30 seconds to undo this action
   */
  async removeFromShelf(userId: string, itemId: string): Promise<{ deletedAt: Date }> {
    const existing = await this.prisma.userProduct.findFirst({
      where: { id: itemId, userId },
      include: { product: { select: { name: true } } },
    });

    if (!existing) {
      throw new NotFoundException('Товар не найден на полке');
    }

    const deletedAt = new Date();

    // Soft delete: change status to ARCHIVED and set deletedAt
    await this.prisma.userProduct.update({
      where: { id: itemId },
      data: { 
        status: 'ARCHIVED',
        deletedAt,
      },
    });

    // Log to AuditLog
    await this.logAction(userId, 'shelf_remove', {
      itemId,
      productId: existing.productId,
      productName: existing.product.name,
    });

    this.logger.log(`User ${userId} removed item ${itemId} from shelf (undo available for 30 sec)`);

    return { deletedAt };
  }

  /**
   * POST /api/shelf/:itemId/undo-delete - Undo soft delete
   * Only works within 30 seconds of deletion!
   */
  async undoDelete(userId: string, itemId: string): Promise<ShelfItem> {
    const existing = await this.prisma.userProduct.findFirst({
      where: { id: itemId, userId, status: 'ARCHIVED' },
      include: { product: { select: { name: true } } },
    });

    if (!existing) {
      throw new NotFoundException('Товар не найден');
    }

    // Check if undo is within 30 seconds
    if (existing.deletedAt) {
      const elapsed = Date.now() - existing.deletedAt.getTime();
      if (elapsed > UNDO_TIMEOUT_MS) {
        throw new BadRequestException('Время для отмены удаления истекло (30 секунд)');
      }
    }

    const item = await this.prisma.userProduct.update({
      where: { id: itemId },
      data: { 
        status: 'ACTIVE',
        deletedAt: null, // Clear deletedAt
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            imageUrl: true,
            category: true,
          },
        },
      },
    });

    // Handle case where product was deleted from database
    const isUnavailable = !item.product;
    const product = item.product || {
      id: item.productId,
      name: 'Товар удалён',
      brand: null,
      imageUrl: null,
      category: 'Недоступно',
    };

    // Log to AuditLog
    await this.logAction(userId, 'shelf_undo_remove', {
      itemId,
      productId: item.productId,
      productName: product.name,
    });

    this.logger.log(`User ${userId} undid removal of item ${itemId}`);

    return {
      id: item.id,
      productId: item.productId,
      product,
      isUnavailable,
      status: item.status,
      notes: item.notes,
      rating: item.rating,
      openedAt: item.openedAt,
      finishedAt: item.finishedAt,
      createdAt: item.createdAt,
    };
  }

  /**
   * Log action to AuditLog table
   */
  private async logAction(userId: string, action: string, metadata: Record<string, unknown>): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          resource: 'shelf',
          resourceId: (metadata.itemId as string) || null,
          ip: 'internal',
          userAgent: 'api',
          metadata: metadata as object,
        },
      });
    } catch (error) {
      // Don't fail the main operation if logging fails
      this.logger.error('Failed to log action', error);
    }
  }

  /**
   * GET /api/shelf/score - Get shelf overall score with LLM analysis
   */
  async getShelfScore(userId: string): Promise<{
    score: number | null;
    analysis: ShelfAnalysis | null;
    personalized: boolean;
  }> {
    // Get active shelf items
    const items = await this.prisma.userProduct.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            ingredients: true,
          },
        },
      },
    });

    if (items.length === 0) {
      return { score: null, analysis: null, personalized: false };
    }

    // Get user's system prompt
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { systemPrompt: true },
    });

    if (!user?.systemPrompt) {
      return {
        score: 70, // Default score
        analysis: null,
        personalized: false,
      };
    }

    try {
      const products = items.map(i => ({
        id: i.product.id,
        name: i.product.name,
        brand: i.product.brand,
        ingredients: i.product.ingredients,
      }));

      const analysis = await this.llm.analyzeShelf(products, user.systemPrompt);

      return {
        score: analysis.overallScore,
        analysis,
        personalized: true,
      };
    } catch {
      return {
        score: 70,
        analysis: null,
        personalized: false,
      };
    }
  }

  /**
   * GET /api/shelf/analyze - Get shelf analysis from LLM
   */
  async analyzeShelf(userId: string): Promise<ShelfAnalysis | null> {
    const result = await this.getShelfScore(userId);
    return result.analysis;
  }

  /**
   * GET /api/shelf/recommendations - Get shelf-based recommendations
   */
  async getRecommendations(userId: string): Promise<{
    suggestions: Array<{
      type: 'add' | 'replace' | 'remove';
      product?: string;
      reason: string;
    }>;
    conflicts: Array<{
      products: string[];
      reason: string;
    }>;
    synergies: Array<{
      products: string[];
      benefit: string;
    }>;
  }> {
    const shelfScore = await this.getShelfScore(userId);

    if (!shelfScore.analysis) {
      return {
        suggestions: [
          {
            type: 'add',
            reason: 'Пройдите опросы для персональных рекомендаций',
          },
        ],
        conflicts: [],
        synergies: [],
      };
    }

    return {
      suggestions: shelfScore.analysis.suggestions,
      conflicts: shelfScore.analysis.conflicts,
      synergies: shelfScore.analysis.synergies,
    };
  }

  /**
   * GET /api/shelf/history - Get shelf change history
   */
  async getHistory(userId: string): Promise<Array<{
    id: string;
    productId: string;
    productName: string;
    action: string;
    date: Date;
  }>> {
    // Get all user products including archived
    const items = await this.prisma.userProduct.findMany({
      where: { userId },
      include: {
        product: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    // Create simple history from status
    return items.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      action: item.status === 'ARCHIVED' ? 'removed' :
              item.status === 'FINISHED' ? 'finished' :
              item.status === 'WISHLIST' ? 'wishlisted' : 'added',
      date: item.updatedAt,
    }));
  }
}
