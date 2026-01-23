import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { ProductAnalysis } from '../llm/llm.types';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: jest.Mocked<PrismaService>;
  let llmService: jest.Mocked<LlmService>;

  const mockProduct = {
    id: 'product-1',
    itemId: 'item-123',
    name: 'Test Cream',
    brand: 'TestBrand',
    productType: 'cream',
    category: 'face',
    categoryPath: 'face/cream',
    description: 'A test cream',
    howToUse: 'Apply daily',
    inci: 'AQUA, GLYCERIN',
    ingredients: ['Aqua', 'Glycerin', 'Niacinamide'],
    attributes: { volume: '50ml' },
    skinType: 'all',
    purpose: 'moisturizing',
    imageUrl: 'https://example.com/image.jpg',
    imageCount: 1,
    priceRegular: 1000,
    priceDiscount: 800,
    discountPercent: 20,
    inStock: true,
    country: 'Russia',
    brandDescription: 'Test brand',
    score: 75,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    systemPrompt: 'User has oily skin and prefers lightweight products',
  };

  const mockAnalysis: ProductAnalysis = {
    score: 85,
    pros: ['Good for oily skin', 'Lightweight'],
    cons: ['May be drying'],
    recommendation: 'Great choice for your skin type',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      product: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      ingredient: {
        findFirst: jest.fn(),
      },
      productReport: {
        create: jest.fn(),
      },
    };

    const mockLlmService = {
      analyzeProduct: jest.fn(),
      askAboutProduct: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: LlmService,
          useValue: mockLlmService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get(PrismaService);
    llmService = module.get(LlmService);
  });

  describe('getProduct', () => {
    it('should return product with personalized score when user has system prompt', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      llmService.analyzeProduct.mockResolvedValue(mockAnalysis);

      const result = await service.getProduct('user-1', 'product-1');

      expect(result.id).toBe('product-1');
      expect(result.name).toBe('Test Cream');
      expect(result.personalScore).toBe(85);
      expect(result.analysis).toEqual(mockAnalysis);
      expect(llmService.analyzeProduct).toHaveBeenCalledWith(
        'product-1',
        'Test Cream',
        'TestBrand',
        ['Aqua', 'Glycerin', 'Niacinamide'],
        mockUser.systemPrompt,
      );
    });

    it('should return product without personalized score when user has no system prompt', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);
      prismaService.user.findUnique.mockResolvedValue({ id: 'user-1', systemPrompt: null });

      const result = await service.getProduct('user-1', 'product-1');

      expect(result.id).toBe('product-1');
      expect(result.personalScore).toBeNull();
      expect(result.analysis).toBeNull();
      expect(llmService.analyzeProduct).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when product not found', async () => {
      prismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.getProduct('user-1', 'product-1')).rejects.toThrow(NotFoundException);
    });

    it('should return product without analysis when LLM fails', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      llmService.analyzeProduct.mockRejectedValue(new Error('LLM error'));

      const result = await service.getProduct('user-1', 'product-1');

      expect(result.id).toBe('product-1');
      expect(result.personalScore).toBeNull();
      expect(result.analysis).toBeNull();
    });
  });

  describe('getProductScore', () => {
    it('should return personalized score when user has system prompt', async () => {
      prismaService.product.findUnique.mockResolvedValue({
        id: 'product-1',
        name: 'Test Cream',
        brand: 'TestBrand',
        ingredients: ['Aqua', 'Glycerin'],
        score: 75,
      });
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      llmService.analyzeProduct.mockResolvedValue(mockAnalysis);

      const result = await service.getProductScore('user-1', 'product-1');

      expect(result.score).toBe(85);
      expect(result.personalized).toBe(true);
      expect(result.pros).toEqual(['Good for oily skin', 'Lightweight']);
      expect(result.cons).toEqual(['May be drying']);
      expect(result.recommendation).toBe('Great choice for your skin type');
    });

    it('should return general score when user has no system prompt', async () => {
      prismaService.product.findUnique.mockResolvedValue({
        id: 'product-1',
        name: 'Test Cream',
        brand: 'TestBrand',
        ingredients: ['Aqua'],
        score: 75,
      });
      prismaService.user.findUnique.mockResolvedValue({ id: 'user-1', systemPrompt: null });

      const result = await service.getProductScore('user-1', 'product-1');

      expect(result.score).toBe(75);
      expect(result.personalized).toBe(false);
      expect(result.pros).toBeUndefined();
    });

    it('should throw NotFoundException when product not found', async () => {
      prismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.getProductScore('user-1', 'product-1')).rejects.toThrow(NotFoundException);
    });

    it('should fallback to general score when LLM fails', async () => {
      prismaService.product.findUnique.mockResolvedValue({
        id: 'product-1',
        name: 'Test Cream',
        brand: 'TestBrand',
        ingredients: ['Aqua'],
        score: 75,
      });
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      llmService.analyzeProduct.mockRejectedValue(new Error('LLM error'));

      const result = await service.getProductScore('user-1', 'product-1');

      expect(result.score).toBe(75);
      expect(result.personalized).toBe(false);
    });
  });

  describe('getProductIngredients', () => {
    it('should return ingredients with matched details', async () => {
      prismaService.product.findUnique.mockResolvedValue({
        inci: 'AQUA, GLYCERIN',
        ingredients: ['Aqua', 'Glycerin'],
      });
      prismaService.ingredient.findFirst
        .mockResolvedValueOnce({
          nameInci: 'AQUA',
          nameEn: 'Water',
          nameRu: 'Вода',
          safetyRating: 'safe',
          ewgScore: 1,
          functions: ['solvent'],
          description: 'Universal solvent',
        })
        .mockResolvedValueOnce({
          nameInci: 'GLYCERIN',
          nameEn: 'Glycerin',
          nameRu: 'Глицерин',
          safetyRating: 'safe',
          ewgScore: 1,
          functions: ['humectant'],
          description: 'Moisturizing agent',
        });

      const result = await service.getProductIngredients('product-1');

      expect(result.inci).toBe('AQUA, GLYCERIN');
      expect(result.ingredients).toHaveLength(2);
      expect(result.ingredients[0]).toEqual({
        name: 'Aqua',
        nameRu: 'Вода',
        safety: 'safe',
        ewgScore: 1,
        functions: ['solvent'],
        description: 'Universal solvent',
      });
    });

    it('should return basic ingredient info when not matched', async () => {
      prismaService.product.findUnique.mockResolvedValue({
        inci: 'UNKNOWN_INGREDIENT',
        ingredients: ['Unknown Ingredient'],
      });
      prismaService.ingredient.findFirst.mockResolvedValue(null);

      const result = await service.getProductIngredients('product-1');

      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0]).toEqual({ name: 'Unknown Ingredient' });
    });

    it('should throw NotFoundException when product not found', async () => {
      prismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.getProductIngredients('product-1')).rejects.toThrow(NotFoundException);
    });

    it('should limit ingredients to 50', async () => {
      const manyIngredients = Array.from({ length: 100 }, (_, i) => `Ingredient${i}`);
      prismaService.product.findUnique.mockResolvedValue({
        inci: 'MANY',
        ingredients: manyIngredients,
      });
      prismaService.ingredient.findFirst.mockResolvedValue(null);

      const result = await service.getProductIngredients('product-1');

      expect(result.ingredients).toHaveLength(50);
    });
  });

  describe('reportProduct', () => {
    it('should create product report', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);
      prismaService.productReport.create.mockResolvedValue({
        id: 'report-1',
        productId: 'product-1',
        userId: 'user-1',
        type: 'incorrect_info',
        description: 'Wrong price',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending',
      });

      const result = await service.reportProduct('user-1', 'product-1', 'incorrect_info', 'Wrong price');

      expect(result.ticketId).toBe('report-1');
      expect(prismaService.productReport.create).toHaveBeenCalledWith({
        data: {
          productId: 'product-1',
          userId: 'user-1',
          type: 'incorrect_info',
          description: 'Wrong price',
        },
      });
    });

    it('should create report with null userId for anonymous users', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);
      prismaService.productReport.create.mockResolvedValue({
        id: 'report-2',
        productId: 'product-1',
        userId: null,
        type: 'incorrect_info',
        description: 'Wrong info',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending',
      });

      const result = await service.reportProduct(null, 'product-1', 'incorrect_info', 'Wrong info');

      expect(result.ticketId).toBe('report-2');
      expect(prismaService.productReport.create).toHaveBeenCalledWith({
        data: {
          productId: 'product-1',
          userId: null,
          type: 'incorrect_info',
          description: 'Wrong info',
        },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      prismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.reportProduct('user-1', 'product-1', 'incorrect_info', 'Wrong')).rejects.toThrow(NotFoundException);
    });
  });

  describe('askAboutProduct', () => {
    it('should return LLM answer about product', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      llmService.askAboutProduct.mockResolvedValue({
        content: 'This product is great for oily skin',
        provider: 'yandex',
      });

      const result = await service.askAboutProduct('user-1', 'product-1', 'Is this good for oily skin?');

      expect(result.answer).toBe('This product is great for oily skin');
      expect(result.provider).toBe('yandex');
      expect(llmService.askAboutProduct).toHaveBeenCalledWith(
        'product-1',
        'Test Cream',
        'TestBrand',
        ['Aqua', 'Glycerin', 'Niacinamide'],
        'Is this good for oily skin?',
        mockUser.systemPrompt,
        [],
      );
    });

    it('should use default system prompt when user has none', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);
      prismaService.user.findUnique.mockResolvedValue({ id: 'user-1', systemPrompt: null });
      llmService.askAboutProduct.mockResolvedValue({
        content: 'This is a moisturizing cream',
        provider: 'yandex',
      });

      await service.askAboutProduct('user-1', 'product-1', 'What is this?');

      expect(llmService.askAboutProduct).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(Array),
        expect.any(String),
        expect.stringContaining('эксперт-консультант'), // DEFAULT_SYSTEM_PROMPT contains this
        [],
      );
    });

    it('should pass conversation history', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      llmService.askAboutProduct.mockResolvedValue({
        content: 'Yes, it contains niacinamide',
        provider: 'yandex',
      });

      const history = [
        { role: 'user' as const, content: 'What ingredients does it have?' },
        { role: 'assistant' as const, content: 'It contains Aqua, Glycerin, and Niacinamide' },
      ];

      await service.askAboutProduct('user-1', 'product-1', 'Does it have niacinamide?', history);

      expect(llmService.askAboutProduct).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(Array),
        'Does it have niacinamide?',
        expect.any(String),
        history,
      );
    });

    it('should throw NotFoundException when product not found', async () => {
      prismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.askAboutProduct('user-1', 'product-1', 'Question?')).rejects.toThrow(NotFoundException);
    });
  });
});
