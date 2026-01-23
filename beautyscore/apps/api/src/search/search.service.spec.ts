import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SearchService } from './search.service';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { SurveysService } from '../surveys/surveys.service';
import { ProductCategory } from '@prisma/client';

describe('SearchService', () => {
  let service: SearchService;
  let prismaService: jest.Mocked<PrismaService>;
  let llmService: jest.Mocked<LlmService>;
  let surveysService: jest.Mocked<SurveysService>;

  const mockProducts = [
    {
      id: 'product-1',
      name: 'Test Cream',
      brand: 'TestBrand',
      productType: 'cream',
      imageUrl: 'https://example.com/1.jpg',
      priceRegular: 1000,
      priceDiscount: 800,
      score: 75,
    },
    {
      id: 'product-2',
      name: 'Test Serum',
      brand: 'TestBrand',
      productType: 'serum',
      imageUrl: 'https://example.com/2.jpg',
      priceRegular: 1500,
      priceDiscount: null,
      score: 85,
    },
  ];

  beforeEach(async () => {
    const mockPrismaService = {
      product: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      ingredient: {
        findMany: jest.fn(),
      },
      searchHistory: {
        create: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
        groupBy: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    const mockLlmService = {
      complete: jest.fn(),
    };

    const mockSurveysService = {
      hasCompletedSurveys: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LlmService, useValue: mockLlmService },
        { provide: SurveysService, useValue: mockSurveysService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    prismaService = module.get(PrismaService);
    llmService = module.get(LlmService);
    surveysService = module.get(SurveysService);
  });

  describe('search', () => {
    it('should return search results', async () => {
      prismaService.product.findMany.mockResolvedValue(mockProducts);
      prismaService.product.count.mockResolvedValue(2);
      prismaService.searchHistory.create.mockResolvedValue({} as any);

      const result = await service.search('user-1', { q: 'test' });

      expect(result.products).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.hasMore).toBe(false);
      expect(prismaService.searchHistory.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for short query', async () => {
      await expect(service.search('user-1', { q: 'a' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty query', async () => {
      await expect(service.search('user-1', { q: '' })).rejects.toThrow(BadRequestException);
    });

    it('should filter by category', async () => {
      prismaService.product.findMany.mockResolvedValue([mockProducts[0]]);
      prismaService.product.count.mockResolvedValue(1);
      prismaService.searchHistory.create.mockResolvedValue({} as any);

      await service.search('user-1', { q: 'test', category: 'FACE' as ProductCategory });

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'FACE',
          }),
        }),
      );
    });

    it('should filter by price range', async () => {
      prismaService.product.findMany.mockResolvedValue(mockProducts);
      prismaService.product.count.mockResolvedValue(2);
      prismaService.searchHistory.create.mockResolvedValue({} as any);

      await service.search('user-1', { q: 'test', minPrice: 500, maxPrice: 2000 });

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            priceRegular: { gte: 500, lte: 2000 },
          }),
        }),
      );
    });

    it('should paginate results', async () => {
      prismaService.product.findMany.mockResolvedValue(mockProducts);
      prismaService.product.count.mockResolvedValue(50);
      prismaService.searchHistory.create.mockResolvedValue({} as any);

      const result = await service.search('user-1', { q: 'test', page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.hasMore).toBe(true);
      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it('should sanitize query', async () => {
      prismaService.product.findMany.mockResolvedValue([]);
      prismaService.product.count.mockResolvedValue(0);
      prismaService.searchHistory.create.mockResolvedValue({} as any);

      await service.search('user-1', { q: 'test<script>alert(1)</script>' });

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: { contains: 'testscriptalert1script', mode: 'insensitive' },
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe('getSuggestions', () => {
    it('should return suggestions', async () => {
      prismaService.product.findMany.mockResolvedValue([
        { name: 'Test Cream', brand: 'TestBrand' },
        { name: 'Test Serum', brand: 'TestBrand' },
      ]);
      prismaService.ingredient.findMany.mockResolvedValue([
        { nameRu: 'Ниацинамид' },
      ]);

      const result = await service.getSuggestions('test');

      expect(result).toContain('TestBrand');
      expect(result).toContain('Test Cream');
      expect(result).toContain('Ниацинамид');
    });

    it('should return empty array for short query', async () => {
      const result = await service.getSuggestions('a');
      expect(result).toEqual([]);
    });

    it('should limit suggestions to 10', async () => {
      const manyProducts = Array.from({ length: 15 }, (_, i) => ({
        name: `Product ${i}`,
        brand: `Brand ${i}`,
      }));
      prismaService.product.findMany.mockResolvedValue(manyProducts);
      prismaService.ingredient.findMany.mockResolvedValue([]);

      const result = await service.getSuggestions('product');

      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getPopularSearches', () => {
    it('should return popular searches', async () => {
      prismaService.searchHistory.groupBy.mockResolvedValue([
        { query: 'крем для лица', _count: { id: 100 } },
        { query: 'сыворотка', _count: { id: 50 } },
      ] as any);

      const result = await service.getPopularSearches();

      expect(result).toEqual(['крем для лица', 'сыворотка']);
    });
  });

  describe('askLlm', () => {
    it('should return LLM answer with products', async () => {
      surveysService.hasCompletedSurveys.mockResolvedValue({ any: true, skin: true, hair: false, lifestyle: false });
      prismaService.user.findUnique.mockResolvedValue({ systemPrompt: 'User prompt' });
      llmService.complete.mockResolvedValue({
        content: 'Рекомендую Test Cream от TestBrand',
        provider: 'yandex',
      });
      prismaService.searchHistory.create.mockResolvedValue({} as any);
      prismaService.product.findMany.mockResolvedValue([
        { id: 'product-1', name: 'Test Cream', brand: 'TestBrand', imageUrl: 'https://example.com/1.jpg' },
      ]);

      const result = await service.askLlm('user-1', 'Какой крем выбрать?');

      expect(result.answer).toContain('Test Cream');
      expect(result.provider).toBe('yandex');
      expect(result.products).toHaveLength(1);
    });

    it('should throw BadRequestException for short question', async () => {
      await expect(service.askLlm('user-1', 'hi')).rejects.toThrow(BadRequestException);
    });

    it('should truncate long questions', async () => {
      const longQuestion = 'a'.repeat(600);
      surveysService.hasCompletedSurveys.mockResolvedValue({ any: false, skin: false, hair: false, lifestyle: false });
      prismaService.user.findUnique.mockResolvedValue({ systemPrompt: null });
      llmService.complete.mockResolvedValue({
        content: 'Answer',
        provider: 'yandex',
      });
      prismaService.searchHistory.create.mockResolvedValue({} as any);
      prismaService.product.findMany.mockResolvedValue([]);

      await service.askLlm('user-1', longQuestion);

      expect(llmService.complete).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.any(String),
          }),
        ]),
        expect.any(Object),
      );
      
      const call = llmService.complete.mock.calls[0];
      const userMessage = call[0].find(m => m.role === 'user');
      expect(userMessage?.content.length).toBeLessThanOrEqual(500);
    });

    it('should use default prompt when user has no system prompt', async () => {
      surveysService.hasCompletedSurveys.mockResolvedValue({ any: false, skin: false, hair: false, lifestyle: false });
      prismaService.user.findUnique.mockResolvedValue({ systemPrompt: null });
      llmService.complete.mockResolvedValue({
        content: 'Answer',
        provider: 'yandex',
      });
      prismaService.searchHistory.create.mockResolvedValue({} as any);
      prismaService.product.findMany.mockResolvedValue([]);

      await service.askLlm('user-1', 'Какой крем выбрать?');

      expect(llmService.complete).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('консультант'),
          }),
        ]),
        expect.any(Object),
      );
    });
  });

  describe('getHistory', () => {
    it('should return user search history', async () => {
      const mockHistory = [
        { id: 'h1', query: 'крем', type: 'text', createdAt: new Date() },
        { id: 'h2', query: 'сыворотка', type: 'llm', createdAt: new Date() },
      ];
      prismaService.searchHistory.findMany.mockResolvedValue(mockHistory);

      const result = await service.getHistory('user-1');

      expect(result).toEqual(mockHistory);
      expect(prismaService.searchHistory.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: expect.any(Object),
      });
    });

    it('should respect limit parameter', async () => {
      prismaService.searchHistory.findMany.mockResolvedValue([]);

      await service.getHistory('user-1', 5);

      expect(prismaService.searchHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });
  });

  describe('clearHistory', () => {
    it('should clear all user history', async () => {
      prismaService.searchHistory.deleteMany.mockResolvedValue({ count: 10 });

      await service.clearHistory('user-1');

      expect(prismaService.searchHistory.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });

  describe('deleteHistoryItem', () => {
    it('should delete specific history item', async () => {
      prismaService.searchHistory.deleteMany.mockResolvedValue({ count: 1 });

      await service.deleteHistoryItem('user-1', 'history-1');

      expect(prismaService.searchHistory.deleteMany).toHaveBeenCalledWith({
        where: { id: 'history-1', userId: 'user-1' },
      });
    });
  });
});
