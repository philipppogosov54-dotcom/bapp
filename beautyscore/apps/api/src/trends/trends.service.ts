import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SurveysService } from '../surveys/surveys.service';
import { ProductCategory } from '@prisma/client';

export interface TrendProduct {
  id: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  category: string;
  priceRegular: number | null;
  priceDiscount: number | null;
}

export interface TrendItem {
  id: string;
  title: string;
  description: string;
  products: TrendProduct[];
  category?: string;
}

@Injectable()
export class TrendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly surveys: SurveysService,
  ) {}

  /**
   * GET /api/trends - Get general trends
   */
  async getTrends(): Promise<{
    featured: TrendItem;
    categories: TrendItem[];
  }> {
    // Get featured trend (most popular category)
    const popularProducts = await this.prisma.product.findMany({
      where: { inStock: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        name: true,
        brand: true,
        imageUrl: true,
        category: true,
        priceRegular: true,
        priceDiscount: true,
      },
    });

    const featured: TrendItem = {
      id: 'featured',
      title: 'Новинки',
      description: 'Самые свежие поступления',
      products: popularProducts,
    };

    // Get trends by category
    const categories = await this.prisma.product.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 4,
    });

    const categoryTrends: TrendItem[] = await Promise.all(
      categories.map(async (cat) => {
        const products = await this.prisma.product.findMany({
          where: { category: cat.category, inStock: true },
          take: 4,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            brand: true,
            imageUrl: true,
            category: true,
            priceRegular: true,
            priceDiscount: true,
          },
        });

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
          id: cat.category,
          title: categoryNames[cat.category] || cat.category,
          description: `${cat._count.id} товаров`,
          products,
          category: cat.category,
        };
      }),
    );

    return { featured, categories: categoryTrends };
  }

  /**
   * GET /api/trends/personalized - Get personalized trends based on profile
   */
  async getPersonalizedTrends(userId: string): Promise<{
    forYou: TrendItem[];
    based_on: string[];
  }> {
    // Get user's survey status
    const surveyStatus = await this.surveys.hasCompletedSurveys(userId);

    if (!surveyStatus.any) {
      return {
        forYou: [],
        based_on: [],
      };
    }

    // Get user's profile from surveys
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { skinType: true, hairType: true, allergies: true },
    });

    const forYou: TrendItem[] = [];
    const basedOn: string[] = [];

    // Recommend based on skin type
    if (user?.skinType) {
      const skinTypeProducts = await this.prisma.product.findMany({
        where: {
          skinType: { contains: user.skinType, mode: 'insensitive' },
          inStock: true,
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          brand: true,
          imageUrl: true,
          category: true,
          priceRegular: true,
          priceDiscount: true,
        },
      });

      if (skinTypeProducts.length > 0) {
        forYou.push({
          id: 'skin-type',
          title: `Для ${user.skinType.toLowerCase()} кожи`,
          description: 'Подобрано по вашему типу кожи',
          products: skinTypeProducts,
        });
        basedOn.push('тип кожи');
      }
    }

    // Recommend skincare if user did dermatology survey
    if (surveyStatus.dermatology) {
      const skincareProducts = await this.prisma.product.findMany({
        where: {
          category: 'SKINCARE',
          inStock: true,
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          brand: true,
          imageUrl: true,
          category: true,
          priceRegular: true,
          priceDiscount: true,
        },
      });

      forYou.push({
        id: 'skincare-recommended',
        title: 'Рекомендации для кожи',
        description: 'На основе дерматологического опроса',
        products: skincareProducts,
      });
      basedOn.push('дерматология');
    }

    // Recommend haircare if user did trichology survey
    if (surveyStatus.trichology) {
      const haircareProducts = await this.prisma.product.findMany({
        where: {
          category: 'HAIRCARE',
          inStock: true,
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          brand: true,
          imageUrl: true,
          category: true,
          priceRegular: true,
          priceDiscount: true,
        },
      });

      if (haircareProducts.length > 0) {
        forYou.push({
          id: 'haircare-recommended',
          title: 'Рекомендации для волос',
          description: 'На основе трихологического опроса',
          products: haircareProducts,
        });
        basedOn.push('трихология');
      }
    }

    return { forYou, based_on: basedOn };
  }

  /**
   * GET /api/trends/weekly - Get weekly highlights
   */
  async getWeeklyTrends(): Promise<{
    week_number: number;
    highlights: TrendItem[];
  }> {
    const weekNumber = this.getWeekNumber(new Date());

    // Get weekly highlights (most viewed/added products)
    const weeklyProducts = await this.prisma.product.findMany({
      where: { inStock: true },
      take: 8,
      orderBy: [
        { discountPercent: 'desc' }, // Prioritize discounted items
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        brand: true,
        imageUrl: true,
        category: true,
        priceRegular: true,
        priceDiscount: true,
      },
    });

    const highlights: TrendItem[] = [
      {
        id: 'weekly-bestsellers',
        title: `Хиты недели #${weekNumber}`,
        description: 'Самые популярные товары этой недели',
        products: weeklyProducts.slice(0, 4),
      },
      {
        id: 'weekly-discounts',
        title: 'Скидки недели',
        description: 'Лучшие предложения',
        products: weeklyProducts.slice(4, 8),
      },
    ];

    return { week_number: weekNumber, highlights };
  }

  /**
   * GET /api/trends/by-category/:category - Get trends for specific category
   */
  async getTrendsByCategory(category: ProductCategory): Promise<{
    category: string;
    categoryName: string;
    trends: TrendItem[];
  }> {
    const categoryNames: Record<ProductCategory, string> = {
      SKINCARE: 'Уход за кожей',
      HAIRCARE: 'Уход за волосами',
      MAKEUP: 'Макияж',
      BODY: 'Уход за телом',
      SUNCARE: 'Солнцезащита',
      FRAGRANCE: 'Ароматы',
      OTHER: 'Другое',
    };

    // Get popular products in category
    const popularProducts = await this.prisma.product.findMany({
      where: { category, inStock: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        name: true,
        brand: true,
        imageUrl: true,
        category: true,
        priceRegular: true,
        priceDiscount: true,
      },
    });

    // Get discounted products
    const discountedProducts = await this.prisma.product.findMany({
      where: {
        category,
        inStock: true,
        discountPercent: { gt: 0 },
      },
      orderBy: { discountPercent: 'desc' },
      take: 4,
      select: {
        id: true,
        name: true,
        brand: true,
        imageUrl: true,
        category: true,
        priceRegular: true,
        priceDiscount: true,
      },
    });

    const trends: TrendItem[] = [
      {
        id: `${category}-popular`,
        title: 'Популярные',
        description: 'Самые популярные товары в категории',
        products: popularProducts.slice(0, 4),
      },
      {
        id: `${category}-new`,
        title: 'Новинки',
        description: 'Недавно добавленные',
        products: popularProducts.slice(4, 8),
      },
    ];

    if (discountedProducts.length > 0) {
      trends.push({
        id: `${category}-discounts`,
        title: 'Со скидкой',
        description: 'Выгодные предложения',
        products: discountedProducts,
      });
    }

    return {
      category,
      categoryName: categoryNames[category] || category,
      trends,
    };
  }

  // Helper to get ISO week number
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
