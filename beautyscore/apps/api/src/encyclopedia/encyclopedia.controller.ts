import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { EncyclopediaService } from './encyclopedia.service';
import { Public } from '../common/decorators/public.decorator';
import { ProductCategory } from '@prisma/client';

/**
 * Encyclopedia Controller
 * 
 * Provides public access to product and ingredient data
 * WITHOUT personalization (available for all users)
 * 
 * Endpoints:
 * - GET /api/encyclopedia/products
 * - GET /api/encyclopedia/products/:id
 * - GET /api/encyclopedia/search
 * - GET /api/encyclopedia/categories
 * - GET /api/encyclopedia/brands
 * - GET /api/encyclopedia/filters
 * - GET /api/encyclopedia/ingredients
 * - GET /api/encyclopedia/ingredients/:name
 */
@Controller('encyclopedia')
export class EncyclopediaController {
  constructor(private readonly encyclopediaService: EncyclopediaService) {}

  /**
   * GET /api/encyclopedia/products
   * List products with pagination and filters
   * Public endpoint - no auth required
   */
  @Public()
  @Get('products')
  async getProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('category') category?: ProductCategory,
    @Query('brand') brand?: string,
    @Query('search') search?: string,
    @Query('skinType') skinType?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.encyclopediaService.getProducts({
      page,
      limit: Math.min(limit, 100), // Max 100 per page
      category,
      brand,
      search,
      skinType,
      minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
    });
  }

  /**
   * GET /api/encyclopedia/products/:id
   * Get single product details
   * Public endpoint - no auth required
   */
  @Public()
  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    return this.encyclopediaService.getProductById(id);
  }

  /**
   * GET /api/encyclopedia/search
   * Search products and ingredients
   * Public endpoint - no auth required
   */
  @Public()
  @Get('search')
  async search(@Query('q') query: string) {
    return this.encyclopediaService.search(query);
  }

  /**
   * GET /api/encyclopedia/categories
   * Get all categories with counts
   * Public endpoint - no auth required
   */
  @Public()
  @Get('categories')
  async getCategories() {
    return this.encyclopediaService.getCategories();
  }

  /**
   * GET /api/encyclopedia/brands
   * Get all brands with counts
   * Public endpoint - no auth required
   */
  @Public()
  @Get('brands')
  async getBrands(@Query('search') search?: string) {
    return this.encyclopediaService.getBrands(search);
  }

  /**
   * GET /api/encyclopedia/filters
   * Get all available filters
   * Public endpoint - no auth required
   */
  @Public()
  @Get('filters')
  async getFilters() {
    return this.encyclopediaService.getFilters();
  }

  /**
   * GET /api/encyclopedia/ingredients
   * List ingredients with pagination
   * Public endpoint - no auth required
   */
  @Public()
  @Get('ingredients')
  async getIngredients(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.encyclopediaService.getIngredients({
      page,
      limit: Math.min(limit, 100),
      category,
      search,
    });
  }

  /**
   * GET /api/encyclopedia/ingredients/:name
   * Get ingredient by name (INCI, Russian, or English)
   * Public endpoint - no auth required
   */
  @Public()
  @Get('ingredients/:name')
  async getIngredientByName(@Param('name') name: string) {
    return this.encyclopediaService.getIngredientByName(name);
  }
}
