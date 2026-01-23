import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductCategory, Prisma } from '@prisma/client';

export interface ProductListQuery {
  page?: number;
  limit?: number;
  category?: ProductCategory;
  brand?: string;
  search?: string;
  skinType?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface IngredientListQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

@Injectable()
export class EncyclopediaService {
  constructor(private prisma: PrismaService) {}

  /**
   * GET /api/encyclopedia/products
   * List products with pagination and filters
   */
  async getProducts(query: ProductListQuery) {
    const {
      page = 1,
      limit = 20,
      category,
      brand,
      search,
      skinType,
      minPrice,
      maxPrice,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    if (category) {
      where.category = category;
    }

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { productType: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (skinType) {
      where.skinType = { contains: skinType, mode: 'insensitive' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.priceRegular = {};
      if (minPrice !== undefined) {
        where.priceRegular.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.priceRegular.lte = maxPrice;
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          itemId: true,
          name: true,
          brand: true,
          productType: true,
          category: true,
          imageUrl: true,
          priceRegular: true,
          priceDiscount: true,
          discountPercent: true,
          score: true,
          inStock: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      limit,
      hasMore: skip + products.length < total,
    };
  }

  /**
   * GET /api/encyclopedia/products/:id
   * Get single product details (without personalization)
   */
  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }

    return { product };
  }

  /**
   * GET /api/encyclopedia/search
   * Search products and ingredients
   */
  async search(query: string) {
    if (!query || query.length < 2) {
      return { products: [], ingredients: [] };
    }

    const [products, ingredients] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
            { productType: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: {
          id: true,
          name: true,
          brand: true,
          imageUrl: true,
          priceRegular: true,
          priceDiscount: true,
        },
      }),
      this.prisma.ingredient.findMany({
        where: {
          OR: [
            { nameRu: { contains: query, mode: 'insensitive' } },
            { nameEn: { contains: query, mode: 'insensitive' } },
            { nameInci: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: {
          id: true,
          nameRu: true,
          nameEn: true,
          nameInci: true,
          safetyRating: true,
          category: true,
        },
      }),
    ]);

    return { products, ingredients };
  }

  /**
   * GET /api/encyclopedia/categories
   * Get all categories with product counts
   */
  async getCategories() {
    const categories = await this.prisma.product.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    // Map to readable format
    const categoryNames: Record<ProductCategory, string> = {
      SKINCARE: 'Уход за кожей',
      HAIRCARE: 'Уход за волосами',
      MAKEUP: 'Макияж',
      BODY: 'Уход за телом',
      SUNCARE: 'Солнцезащита',
      FRAGRANCE: 'Ароматы',
      OTHER: 'Другое',
    };

    return {
      categories: categories.map((c) => ({
        id: c.category,
        name: categoryNames[c.category] || c.category,
        count: c._count.id,
      })),
    };
  }

  /**
   * GET /api/encyclopedia/brands
   * Get all brands with product counts
   */
  async getBrands(search?: string) {
    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.brand = { contains: search, mode: 'insensitive' };
    }

    const brands = await this.prisma.product.groupBy({
      by: ['brand'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return {
      brands: brands
        .filter((b) => b.brand)
        .map((b) => ({
          name: b.brand!,
          count: b._count.id,
        })),
    };
  }

  /**
   * GET /api/encyclopedia/filters
   * Get all available filters
   */
  async getFilters() {
    const [categories, brands, skinTypes, priceRange] = await Promise.all([
      this.getCategories(),
      this.getBrands(),
      this.prisma.product.findMany({
        where: { skinType: { not: null } },
        select: { skinType: true },
        distinct: ['skinType'],
      }),
      this.prisma.product.aggregate({
        _min: { priceRegular: true },
        _max: { priceRegular: true },
      }),
    ]);

    return {
      categories: categories.categories,
      brands: brands.brands,
      skinTypes: skinTypes.map((s) => s.skinType).filter(Boolean),
      priceRange: {
        min: priceRange._min.priceRegular || 0,
        max: priceRange._max.priceRegular || 10000,
      },
    };
  }

  /**
   * GET /api/encyclopedia/ingredients
   * List ingredients with pagination
   */
  async getIngredients(query: IngredientListQuery) {
    const { page = 1, limit = 20, category, search } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.IngredientWhereInput = {};

    if (category) {
      where.category = category as any;
    }

    if (search) {
      where.OR = [
        { nameRu: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameInci: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [ingredients, total] = await Promise.all([
      this.prisma.ingredient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nameRu: 'asc' },
      }),
      this.prisma.ingredient.count({ where }),
    ]);

    return {
      ingredients,
      total,
      page,
      limit,
      hasMore: skip + ingredients.length < total,
    };
  }

  /**
   * GET /api/encyclopedia/ingredients/:name
   * Get ingredient by INCI name
   */
  async getIngredientByName(name: string) {
    // Try to find by INCI name first, then by Russian name
    let ingredient = await this.prisma.ingredient.findUnique({
      where: { nameInci: name.toUpperCase() },
    });

    if (!ingredient) {
      ingredient = await this.prisma.ingredient.findFirst({
        where: {
          OR: [
            { nameRu: { equals: name, mode: 'insensitive' } },
            { nameEn: { equals: name, mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!ingredient) {
      throw new NotFoundException('Ингредиент не найден');
    }

    // Find products containing this ingredient
    const productsWithIngredient = await this.prisma.product.findMany({
      where: {
        OR: [
          { inci: { contains: ingredient.nameInci || '', mode: 'insensitive' } },
          { ingredients: { hasSome: [ingredient.nameInci || '', ingredient.nameEn || '', ingredient.nameRu] } },
        ],
      },
      take: 10,
      select: {
        id: true,
        name: true,
        brand: true,
        imageUrl: true,
      },
    });

    return {
      ingredient,
      productsWithIngredient,
    };
  }
}
