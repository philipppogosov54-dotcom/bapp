import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LlmService } from './llm.service';
import { GigaChatProvider } from './providers/gigachat.provider';
import { YandexGptProvider } from './providers/yandexgpt.provider';
import { LlmResponse, ProductAnalysis, ShelfAnalysis } from './llm.types';

describe('LlmService', () => {
  let service: LlmService;
  let gigachatProvider: jest.Mocked<GigaChatProvider>;
  let yandexgptProvider: jest.Mocked<YandexGptProvider>;
  let cacheManager: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    // Create mocks
    gigachatProvider = {
      isAvailable: jest.fn(),
      complete: jest.fn(),
    } as unknown as jest.Mocked<GigaChatProvider>;

    yandexgptProvider = {
      isAvailable: jest.fn(),
      complete: jest.fn(),
    } as unknown as jest.Mocked<YandexGptProvider>;

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        { provide: GigaChatProvider, useValue: gigachatProvider },
        { provide: YandexGptProvider, useValue: yandexgptProvider },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    service = module.get<LlmService>(LlmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('complete', () => {
    const testMessages = [{ role: 'user' as const, content: 'Test message' }];

    it('should use GigaChat when available', async () => {
      const expectedResponse: LlmResponse = {
        content: 'GigaChat response',
        provider: 'gigachat',
      };

      gigachatProvider.isAvailable.mockResolvedValue(true);
      gigachatProvider.complete.mockResolvedValue(expectedResponse);

      const result = await service.complete(testMessages);

      expect(result).toEqual(expectedResponse);
      expect(gigachatProvider.isAvailable).toHaveBeenCalled();
      expect(gigachatProvider.complete).toHaveBeenCalledWith(testMessages, {});
      expect(yandexgptProvider.complete).not.toHaveBeenCalled();
    });

    it('should fallback to YandexGPT when GigaChat is unavailable', async () => {
      const expectedResponse: LlmResponse = {
        content: 'YandexGPT response',
        provider: 'yandexgpt',
      };

      gigachatProvider.isAvailable.mockResolvedValue(false);
      yandexgptProvider.isAvailable.mockResolvedValue(true);
      yandexgptProvider.complete.mockResolvedValue(expectedResponse);

      const result = await service.complete(testMessages);

      expect(result).toEqual(expectedResponse);
      expect(yandexgptProvider.complete).toHaveBeenCalledWith(testMessages, {});
    });

    it('should fallback to YandexGPT when GigaChat throws error', async () => {
      const expectedResponse: LlmResponse = {
        content: 'YandexGPT response',
        provider: 'yandexgpt',
      };

      gigachatProvider.isAvailable.mockResolvedValue(true);
      gigachatProvider.complete.mockRejectedValue(new Error('GigaChat error'));
      yandexgptProvider.isAvailable.mockResolvedValue(true);
      yandexgptProvider.complete.mockResolvedValue(expectedResponse);

      const result = await service.complete(testMessages);

      expect(result).toEqual(expectedResponse);
    });

    it('should return fallback response when all providers fail', async () => {
      gigachatProvider.isAvailable.mockResolvedValue(true);
      gigachatProvider.complete.mockRejectedValue(new Error('GigaChat error'));
      yandexgptProvider.isAvailable.mockResolvedValue(true);
      yandexgptProvider.complete.mockRejectedValue(new Error('YandexGPT error'));

      const result = await service.complete(testMessages);

      expect(result.provider).toBe('fallback');
      expect(result.content).toContain('недоступна');
    });

    it('should return fallback response when no providers available', async () => {
      gigachatProvider.isAvailable.mockResolvedValue(false);
      yandexgptProvider.isAvailable.mockResolvedValue(false);

      const result = await service.complete(testMessages);

      expect(result.provider).toBe('fallback');
    });
  });

  describe('analyzeProduct', () => {
    const testProduct = {
      productId: 'test-product-id',
      productName: 'Test Cream',
      productBrand: 'Test Brand',
      productIngredients: ['Water', 'Glycerin', 'Niacinamide'],
      userSystemPrompt: 'User has dry skin',
    };

    it('should return cached result if available', async () => {
      const cachedAnalysis: ProductAnalysis = {
        score: 85,
        pros: ['Good ingredients'],
        cons: ['Expensive'],
        recommendation: 'Great for dry skin',
      };

      cacheManager.get.mockResolvedValue(cachedAnalysis);

      const result = await service.analyzeProduct(
        testProduct.productId,
        testProduct.productName,
        testProduct.productBrand,
        testProduct.productIngredients,
        testProduct.userSystemPrompt,
      );

      expect(result).toEqual(cachedAnalysis);
      expect(gigachatProvider.complete).not.toHaveBeenCalled();
      expect(yandexgptProvider.complete).not.toHaveBeenCalled();
    });

    it('should call LLM and cache result when not cached', async () => {
      const llmResponse: LlmResponse = {
        content: JSON.stringify({
          score: 90,
          pros: ['Hydrating', 'Non-comedogenic'],
          cons: ['Contains fragrance'],
          recommendation: 'Good choice for your skin type',
        }),
        provider: 'yandexgpt',
      };

      cacheManager.get.mockResolvedValue(null);
      gigachatProvider.isAvailable.mockResolvedValue(false);
      yandexgptProvider.isAvailable.mockResolvedValue(true);
      yandexgptProvider.complete.mockResolvedValue(llmResponse);

      const result = await service.analyzeProduct(
        testProduct.productId,
        testProduct.productName,
        testProduct.productBrand,
        testProduct.productIngredients,
        testProduct.userSystemPrompt,
      );

      expect(result.score).toBe(90);
      expect(result.pros).toContain('Hydrating');
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should clamp score to 0-100 range', async () => {
      const llmResponse: LlmResponse = {
        content: JSON.stringify({
          score: 150, // Invalid score
          pros: [],
          cons: [],
          recommendation: 'Test',
        }),
        provider: 'yandexgpt',
      };

      cacheManager.get.mockResolvedValue(null);
      yandexgptProvider.isAvailable.mockResolvedValue(true);
      yandexgptProvider.complete.mockResolvedValue(llmResponse);

      const result = await service.analyzeProduct(
        testProduct.productId,
        testProduct.productName,
        testProduct.productBrand,
        testProduct.productIngredients,
        testProduct.userSystemPrompt,
      );

      expect(result.score).toBe(100);
    });

    it('should handle invalid JSON response gracefully', async () => {
      const llmResponse: LlmResponse = {
        content: 'This is not JSON, just plain text response',
        provider: 'yandexgpt',
      };

      cacheManager.get.mockResolvedValue(null);
      yandexgptProvider.isAvailable.mockResolvedValue(true);
      yandexgptProvider.complete.mockResolvedValue(llmResponse);

      const result = await service.analyzeProduct(
        testProduct.productId,
        testProduct.productName,
        testProduct.productBrand,
        testProduct.productIngredients,
        testProduct.userSystemPrompt,
      );

      expect(result.score).toBe(70); // Default score
      expect(result.recommendation).toContain('This is not JSON');
    });
  });

  describe('analyzeShelf', () => {
    const testProducts = [
      { id: '1', name: 'Cream A', brand: 'Brand A', ingredients: ['Water'] },
      { id: '2', name: 'Serum B', brand: 'Brand B', ingredients: ['Glycerin'] },
    ];
    const testSystemPrompt = 'User profile';

    it('should return cached shelf analysis if available', async () => {
      const cachedAnalysis: ShelfAnalysis = {
        overallScore: 80,
        recommendation: 'Good combination',
        conflicts: [],
        synergies: [],
        suggestions: [],
      };

      cacheManager.get.mockResolvedValue(cachedAnalysis);

      const result = await service.analyzeShelf(testProducts, testSystemPrompt);

      expect(result).toEqual(cachedAnalysis);
    });

    it('should analyze shelf and cache result', async () => {
      const llmResponse: LlmResponse = {
        content: JSON.stringify({
          overallScore: 85,
          recommendation: 'Products work well together',
          conflicts: [],
          synergies: [{ products: ['Cream A', 'Serum B'], benefit: 'Enhanced hydration' }],
          suggestions: [],
        }),
        provider: 'yandexgpt',
      };

      cacheManager.get.mockResolvedValue(null);
      yandexgptProvider.isAvailable.mockResolvedValue(true);
      yandexgptProvider.complete.mockResolvedValue(llmResponse);

      const result = await service.analyzeShelf(testProducts, testSystemPrompt);

      expect(result.overallScore).toBe(85);
      expect(result.synergies).toHaveLength(1);
      expect(cacheManager.set).toHaveBeenCalled();
    });
  });

  describe('askAboutProduct', () => {
    it('should include product info in system message', async () => {
      const expectedResponse: LlmResponse = {
        content: 'This product is good for dry skin',
        provider: 'yandexgpt',
      };

      yandexgptProvider.isAvailable.mockResolvedValue(true);
      yandexgptProvider.complete.mockResolvedValue(expectedResponse);

      const result = await service.askAboutProduct(
        'product-id',
        'Test Cream',
        'Test Brand',
        ['Water', 'Glycerin'],
        'Is this good for dry skin?',
        'User has dry skin',
        [],
      );

      expect(result).toEqual(expectedResponse);
      expect(yandexgptProvider.complete).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('Test Cream'),
          }),
          expect.objectContaining({
            role: 'user',
            content: 'Is this good for dry skin?',
          }),
        ]),
        expect.any(Object),
      );
    });

    it('should include conversation history', async () => {
      const history = [
        { role: 'user' as const, content: 'Previous question' },
        { role: 'assistant' as const, content: 'Previous answer' },
      ];

      yandexgptProvider.isAvailable.mockResolvedValue(true);
      yandexgptProvider.complete.mockResolvedValue({
        content: 'Response',
        provider: 'yandexgpt',
      });

      await service.askAboutProduct(
        'product-id',
        'Test Cream',
        'Test Brand',
        ['Water'],
        'New question',
        'System prompt',
        history,
      );

      expect(yandexgptProvider.complete).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user', content: 'Previous question' }),
          expect.objectContaining({ role: 'assistant', content: 'Previous answer' }),
          expect.objectContaining({ role: 'user', content: 'New question' }),
        ]),
        expect.any(Object),
      );
    });
  });
});
