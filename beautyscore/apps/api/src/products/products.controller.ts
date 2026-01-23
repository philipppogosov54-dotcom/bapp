import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ProductsService } from './products.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Public } from '../common/decorators/public.decorator';

/**
 * Products Controller
 *
 * Personalized product endpoints
 *
 * Endpoints:
 * - GET /api/products/:id - Get product with personalized score
 * - GET /api/products/:id/score - Get only score
 * - GET /api/products/:id/ingredients - Get ingredients with safety
 * - POST /api/products/:id/report - Report incorrect info
 * - POST /api/products/:id/ask - Chat about product
 */
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * GET /api/products/:id
   * Get product with personalized score
   */
  @Get(':id')
  async getProduct(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.getProduct(userId, id);
  }

  /**
   * GET /api/products/:id/score
   * Get only personalized score (faster)
   */
  @Get(':id/score')
  async getProductScore(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.getProductScore(userId, id);
  }

  /**
   * GET /api/products/:id/ingredients
   * Get ingredients with safety info
   * Public endpoint
   */
  @Public()
  @Get(':id/ingredients')
  async getProductIngredients(@Param('id') id: string) {
    return this.productsService.getProductIngredients(id);
  }

  /**
   * POST /api/products/:id/report
   * Report incorrect product info
   * Allows anonymous reports
   */
  @Public()
  @Post(':id/report')
  async reportProduct(
    @CurrentUser('id') userId: string | null,
    @Param('id') id: string,
    @Body('type') type: string,
    @Body('description') description: string,
  ) {
    if (!type || !description) {
      throw new BadRequestException('Укажите тип и описание проблемы');
    }

    const validTypes = ['wrong_info', 'missing_info', 'other'];
    if (!validTypes.includes(type)) {
      throw new BadRequestException('Неверный тип репорта');
    }

    return this.productsService.reportProduct(userId, id, type, description);
  }

  /**
   * POST /api/products/:id/ask
   * Chat about specific product with LLM
   */
  @Post(':id/ask')
  @Throttle({ default: { ttl: 60000, limit: 10 } }) // 10 per minute
  async askAboutProduct(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('question') question: string,
    @Body('history') history?: Array<{ role: 'user' | 'assistant'; content: string }>,
  ) {
    if (!question || question.length < 3) {
      throw new BadRequestException('Слишком короткий вопрос');
    }

    return this.productsService.askAboutProduct(
      userId,
      id,
      question.slice(0, 500),
      history?.slice(-10) || [],
    );
  }
}
