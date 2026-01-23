import { Test, TestingModule } from '@nestjs/testing';
import { ShelfService } from './shelf.service';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ShelfService', () => {
  let service: ShelfService;
  let prismaService: jest.Mocked<PrismaService>;
  let llmService: jest.Mocked<LlmService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockProduct = {
    id: 'product-123',
    name: 'Test Cream',
    brand: 'Test Brand',
    category: 'SKINCARE',
    imageUrl: 'https://example.com/image.jpg',
    ingredients: ['Water', 'Glycerin'],
  };

  const mockUserProduct = {
    id: 'user-product-123',
    userId: mockUser.id,
    productId: mockProduct.id,
    product: mockProduct,
    status: 'ACTIVE',
    notes: null,
    rating: null,
    openedAt: null,
    finishedAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaService = {
      userProduct: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    llmService = {
      analyzeShelf: jest.fn(),
    } as unknown as jest.Mocked<LlmService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShelfService,
        { provide: PrismaService, useValue: prismaService },
        { provide: LlmService, useValue: llmService },
      ],
    }).compile();

    service = module.get<ShelfService>(ShelfService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getShelf', () => {
    it('should return user shelf items', async () => {
      const mockItems = [mockUserProduct];
      (prismaService.userProduct.findMany as jest.Mock).mockResolvedValue(mockItems);

      const result = await service.getShelf(mockUser.id);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockUserProduct.id);
      expect(prismaService.userProduct.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id },
        }),
      );
    });

    it('should return empty array for user with no items', async () => {
      (prismaService.userProduct.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getShelf(mockUser.id);

      expect(result).toEqual([]);
    });

    it('should filter by status when provided', async () => {
      (prismaService.userProduct.findMany as jest.Mock).mockResolvedValue([]);

      await service.getShelf(mockUser.id, 'WISHLIST');

      expect(prismaService.userProduct.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id, status: 'WISHLIST' },
        }),
      );
    });
  });

  describe('addToShelf', () => {
    it('should add product to shelf', async () => {
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prismaService.userProduct.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.userProduct.create as jest.Mock).mockResolvedValue(mockUserProduct);

      const result = await service.addToShelf(mockUser.id, { productId: mockProduct.id });

      expect(result.id).toBe(mockUserProduct.id);
      expect(prismaService.userProduct.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.addToShelf(mockUser.id, { productId: 'non-existent' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if product already on shelf', async () => {
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prismaService.userProduct.findUnique as jest.Mock).mockResolvedValue(mockUserProduct);

      await expect(
        service.addToShelf(mockUser.id, { productId: mockProduct.id }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getShelfItem', () => {
    it('should return shelf item', async () => {
      (prismaService.userProduct.findFirst as jest.Mock).mockResolvedValue(mockUserProduct);

      const result = await service.getShelfItem(mockUser.id, mockUserProduct.id);

      expect(result.id).toBe(mockUserProduct.id);
    });

    it('should throw NotFoundException if item not found', async () => {
      (prismaService.userProduct.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getShelfItem(mockUser.id, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeFromShelf', () => {
    it('should soft delete item from shelf', async () => {
      const mockWithProduct = {
        ...mockUserProduct,
        product: { name: 'Test Cream' },
      };
      (prismaService.userProduct.findFirst as jest.Mock).mockResolvedValue(mockWithProduct);
      (prismaService.userProduct.update as jest.Mock).mockResolvedValue({
        ...mockUserProduct,
        status: 'ARCHIVED',
        deletedAt: new Date(),
      });
      (prismaService.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await service.removeFromShelf(mockUser.id, mockUserProduct.id);

      expect(result.deletedAt).toBeDefined();
      expect(prismaService.userProduct.update).toHaveBeenCalledWith({
        where: { id: mockUserProduct.id },
        data: expect.objectContaining({
          status: 'ARCHIVED',
          deletedAt: expect.any(Date),
        }),
      });
    });

    it('should throw NotFoundException if item not found', async () => {
      (prismaService.userProduct.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.removeFromShelf(mockUser.id, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should log action to audit log', async () => {
      const mockWithProduct = {
        ...mockUserProduct,
        product: { name: 'Test Cream' },
      };
      (prismaService.userProduct.findFirst as jest.Mock).mockResolvedValue(mockWithProduct);
      (prismaService.userProduct.update as jest.Mock).mockResolvedValue({
        ...mockUserProduct,
        status: 'ARCHIVED',
      });
      (prismaService.auditLog.create as jest.Mock).mockResolvedValue({});

      await service.removeFromShelf(mockUser.id, mockUserProduct.id);

      expect(prismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUser.id,
          action: 'shelf_remove',
        }),
      });
    });
  });

  describe('undoDelete', () => {
    it('should restore item within 30 seconds', async () => {
      const recentlyDeleted = {
        ...mockUserProduct,
        status: 'ARCHIVED',
        deletedAt: new Date(Date.now() - 10000), // 10 seconds ago
        product: { name: 'Test Cream' },
      };

      (prismaService.userProduct.findFirst as jest.Mock).mockResolvedValue(recentlyDeleted);
      (prismaService.userProduct.update as jest.Mock).mockResolvedValue({
        ...mockUserProduct,
        status: 'ACTIVE',
        deletedAt: null,
      });
      (prismaService.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await service.undoDelete(mockUser.id, mockUserProduct.id);

      expect(result.status).toBe('ACTIVE');
      expect(prismaService.userProduct.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUserProduct.id },
          data: expect.objectContaining({
            status: 'ACTIVE',
            deletedAt: null,
          }),
        }),
      );
    });

    it('should throw BadRequestException if undo window expired', async () => {
      const oldDeleted = {
        ...mockUserProduct,
        status: 'ARCHIVED',
        deletedAt: new Date(Date.now() - 60000), // 60 seconds ago
        product: { name: 'Test Cream' },
      };

      (prismaService.userProduct.findFirst as jest.Mock).mockResolvedValue(oldDeleted);

      await expect(service.undoDelete(mockUser.id, mockUserProduct.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if item not found', async () => {
      (prismaService.userProduct.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.undoDelete(mockUser.id, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should log undo action to audit log', async () => {
      const recentlyDeleted = {
        ...mockUserProduct,
        status: 'ARCHIVED',
        deletedAt: new Date(Date.now() - 5000),
        product: { name: 'Test Cream' },
      };

      (prismaService.userProduct.findFirst as jest.Mock).mockResolvedValue(recentlyDeleted);
      (prismaService.userProduct.update as jest.Mock).mockResolvedValue({
        ...mockUserProduct,
        status: 'ACTIVE',
        deletedAt: null,
      });
      (prismaService.auditLog.create as jest.Mock).mockResolvedValue({});

      await service.undoDelete(mockUser.id, mockUserProduct.id);

      expect(prismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUser.id,
          action: 'shelf_undo_remove',
        }),
      });
    });
  });

  describe('updateShelfItem', () => {
    it('should update item notes', async () => {
      const updatedItem = { ...mockUserProduct, notes: 'Great product!' };

      (prismaService.userProduct.findFirst as jest.Mock).mockResolvedValue(mockUserProduct);
      (prismaService.userProduct.update as jest.Mock).mockResolvedValue(updatedItem);

      const result = await service.updateShelfItem(mockUser.id, mockUserProduct.id, {
        notes: 'Great product!',
      });

      expect(result.notes).toBe('Great product!');
    });

    it('should update item rating', async () => {
      const updatedItem = { ...mockUserProduct, rating: 5 };

      (prismaService.userProduct.findFirst as jest.Mock).mockResolvedValue(mockUserProduct);
      (prismaService.userProduct.update as jest.Mock).mockResolvedValue(updatedItem);

      const result = await service.updateShelfItem(mockUser.id, mockUserProduct.id, {
        rating: 5,
      });

      expect(result.rating).toBe(5);
    });

    it('should throw BadRequestException for invalid rating', async () => {
      (prismaService.userProduct.findFirst as jest.Mock).mockResolvedValue(mockUserProduct);

      await expect(
        service.updateShelfItem(mockUser.id, mockUserProduct.id, { rating: 10 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if item not found', async () => {
      (prismaService.userProduct.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateShelfItem(mockUser.id, 'non-existent', { notes: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getShelfScore', () => {
    it('should return null score for empty shelf', async () => {
      (prismaService.userProduct.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getShelfScore(mockUser.id);

      expect(result.score).toBeNull();
      expect(result.analysis).toBeNull();
      expect(result.personalized).toBe(false);
    });

    it('should return default score when user has no system prompt', async () => {
      const mockItems = [
        {
          ...mockUserProduct,
          product: { ...mockProduct, ingredients: ['Water', 'Glycerin'] },
        },
      ];

      (prismaService.userProduct.findMany as jest.Mock).mockResolvedValue(mockItems);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({ systemPrompt: null });

      const result = await service.getShelfScore(mockUser.id);

      expect(result.score).toBe(70);
      expect(result.personalized).toBe(false);
    });

    it('should return LLM analysis when user has system prompt', async () => {
      const mockAnalysis = {
        overallScore: 85,
        recommendation: 'Good combination',
        conflicts: [],
        synergies: [],
        suggestions: [],
      };

      const mockItems = [
        {
          ...mockUserProduct,
          product: { ...mockProduct, ingredients: ['Water', 'Glycerin'] },
        },
      ];

      (prismaService.userProduct.findMany as jest.Mock).mockResolvedValue(mockItems);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        systemPrompt: 'User system prompt',
      });
      llmService.analyzeShelf.mockResolvedValue(mockAnalysis);

      const result = await service.getShelfScore(mockUser.id);

      expect(result.score).toBe(85);
      expect(result.analysis).toEqual(mockAnalysis);
      expect(result.personalized).toBe(true);
    });
  });
});
