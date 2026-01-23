import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ShelfService } from './shelf.service';
import type { AddToShelfDto, UpdateShelfItemDto } from './shelf.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ProductStatus } from '@prisma/client';

/**
 * Shelf Controller
 *
 * User's product shelf (personal collection)
 *
 * Endpoints:
 * - GET /api/shelf - Get shelf
 * - POST /api/shelf - Add to shelf
 * - GET /api/shelf/score - Overall score
 * - GET /api/shelf/recommendations - Recommendations
 * - GET /api/shelf/history - Change history
 * - GET /api/shelf/:itemId - Get item
 * - PUT /api/shelf/:itemId - Update item
 * - DELETE /api/shelf/:itemId - Remove item
 * - POST /api/shelf/:itemId/undo-delete - Undo remove
 */
@Controller('shelf')
export class ShelfController {
  constructor(private readonly shelfService: ShelfService) {}

  /**
   * GET /api/shelf
   * Get user's shelf
   */
  @Get()
  async getShelf(
    @CurrentUser('id') userId: string,
    @Query('status') status?: ProductStatus,
  ) {
    const items = await this.shelfService.getShelf(userId, status);
    return { items };
  }

  /**
   * POST /api/shelf
   * Add product to shelf
   */
  @Post()
  async addToShelf(
    @CurrentUser('id') userId: string,
    @Body() dto: AddToShelfDto,
  ) {
    return this.shelfService.addToShelf(userId, dto);
  }

  /**
   * GET /api/shelf/score
   * Get overall shelf score with LLM analysis
   */
  @Get('score')
  async getShelfScore(@CurrentUser('id') userId: string) {
    return this.shelfService.getShelfScore(userId);
  }

  /**
   * GET /api/shelf/analyze
   * Get LLM analysis of shelf products
   */
  @Get('analyze')
  async analyzeShelf(@CurrentUser('id') userId: string) {
    const analysis = await this.shelfService.analyzeShelf(userId);
    return { analysis };
  }

  /**
   * GET /api/shelf/recommendations
   * Get shelf-based recommendations
   */
  @Get('recommendations')
  async getRecommendations(@CurrentUser('id') userId: string) {
    return this.shelfService.getRecommendations(userId);
  }

  /**
   * GET /api/shelf/history
   * Get shelf change history
   */
  @Get('history')
  async getHistory(@CurrentUser('id') userId: string) {
    const history = await this.shelfService.getHistory(userId);
    return { history };
  }

  /**
   * GET /api/shelf/:itemId
   * Get single shelf item
   */
  @Get(':itemId')
  async getShelfItem(
    @CurrentUser('id') userId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.shelfService.getShelfItem(userId, itemId);
  }

  /**
   * PUT /api/shelf/:itemId
   * Update shelf item
   */
  @Put(':itemId')
  async updateShelfItem(
    @CurrentUser('id') userId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateShelfItemDto,
  ) {
    return this.shelfService.updateShelfItem(userId, itemId, dto);
  }

  /**
   * DELETE /api/shelf/:itemId
   * Remove from shelf (soft delete)
   */
  @Delete(':itemId')
  async removeFromShelf(
    @CurrentUser('id') userId: string,
    @Param('itemId') itemId: string,
  ) {
    await this.shelfService.removeFromShelf(userId, itemId);
    return { message: 'Товар удалён с полки', undoAvailable: true };
  }

  /**
   * POST /api/shelf/:itemId/undo-delete
   * Undo soft delete
   */
  @Post(':itemId/undo-delete')
  async undoDelete(
    @CurrentUser('id') userId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.shelfService.undoDelete(userId, itemId);
  }
}
