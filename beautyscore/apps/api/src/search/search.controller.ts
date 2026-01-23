import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SearchService } from './search.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ProductCategory } from '@prisma/client';

/**
 * Search Controller
 *
 * Personalized search with LLM integration
 *
 * Endpoints:
 * - GET /api/search - Search products
 * - GET /api/search/suggestions - Autocomplete
 * - GET /api/search/popular - Popular searches
 * - POST /api/search/ask - LLM chat
 * - GET /api/search/history - User history
 * - DELETE /api/search/history - Clear history
 * - DELETE /api/search/history/:id - Delete item
 */
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * GET /api/search
   * Search products with filters
   */
  @Get()
  async search(
    @CurrentUser('id') userId: string,
    @Query('q') q: string,
    @Query('category') category?: ProductCategory,
    @Query('brand') brand?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('skinType') skinType?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.searchService.search(userId, {
      q,
      category,
      brand,
      minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
      skinType,
      page,
      limit: Math.min(limit || 20, 100),
    });
  }

  /**
   * GET /api/search/suggestions
   * Autocomplete suggestions
   */
  @Get('suggestions')
  async getSuggestions(@Query('q') q: string) {
    const suggestions = await this.searchService.getSuggestions(q);
    return { suggestions };
  }

  /**
   * GET /api/search/popular
   * Popular search queries
   */
  @Get('popular')
  async getPopular() {
    const popular = await this.searchService.getPopularSearches();
    return { popular };
  }

  /**
   * POST /api/search/ask
   * LLM-powered search with rate limiting
   */
  @Post('ask')
  @Throttle({ default: { ttl: 60000, limit: 10 } }) // 10 requests per minute
  async ask(
    @CurrentUser('id') userId: string,
    @Body('question') question: string,
  ) {
    return this.searchService.askLlm(userId, question);
  }

  /**
   * GET /api/search/history
   * User's search history
   */
  @Get('history')
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const history = await this.searchService.getHistory(userId, Math.min(limit, 100));
    return { history };
  }

  /**
   * DELETE /api/search/history
   * Clear all search history
   */
  @Delete('history')
  async clearHistory(@CurrentUser('id') userId: string) {
    await this.searchService.clearHistory(userId);
    return { message: 'История очищена' };
  }

  /**
   * DELETE /api/search/history/:id
   * Delete single history item
   */
  @Delete('history/:id')
  async deleteHistoryItem(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.searchService.deleteHistoryItem(userId, id);
    return { message: 'Запись удалена' };
  }
}
