import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { TrendsService } from './trends.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ProductCategory } from '@prisma/client';

/**
 * Trends Controller
 *
 * Product trends and recommendations
 *
 * Endpoints:
 * - GET /api/trends - General trends
 * - GET /api/trends/personalized - Personalized trends
 * - GET /api/trends/weekly - Weekly highlights
 * - GET /api/trends/by-category/:category - Category trends
 */
@Controller('trends')
export class TrendsController {
  constructor(private readonly trendsService: TrendsService) {}

  /**
   * GET /api/trends
   * Get general trends (public)
   */
  @Public()
  @Get()
  async getTrends() {
    return this.trendsService.getTrends();
  }

  /**
   * GET /api/trends/personalized
   * Get personalized trends based on user profile
   */
  @Get('personalized')
  async getPersonalizedTrends(@CurrentUser('id') userId: string) {
    return this.trendsService.getPersonalizedTrends(userId);
  }

  /**
   * GET /api/trends/weekly
   * Get weekly highlights (public)
   */
  @Public()
  @Get('weekly')
  async getWeeklyTrends() {
    return this.trendsService.getWeeklyTrends();
  }

  /**
   * GET /api/trends/by-category/:category
   * Get trends for specific category (public)
   */
  @Public()
  @Get('by-category/:category')
  async getTrendsByCategory(@Param('category') category: string) {
    const validCategories: ProductCategory[] = [
      'SKINCARE',
      'HAIRCARE',
      'MAKEUP',
      'BODY',
      'SUNCARE',
      'FRAGRANCE',
      'OTHER',
    ];

    if (!validCategories.includes(category as ProductCategory)) {
      throw new BadRequestException('Неизвестная категория');
    }

    return this.trendsService.getTrendsByCategory(category as ProductCategory);
  }
}
