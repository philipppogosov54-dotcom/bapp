import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { PrismaService } from '../prisma/prisma.service';
import { SurveyType } from '@prisma/client';

describe('SurveysService', () => {
  let service: SurveysService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockSurvey = {
    id: 'survey-1',
    userId: 'user-1',
    type: 'BASIC' as SurveyType,
    answers: { gender: 'female', age_range: '25-34' },
    version: '1.0',
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    gender: 'FEMALE',
    dateOfBirth: new Date('1990-01-01'),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      survey: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveysService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SurveysService>(SurveysService);
    prismaService = module.get(PrismaService);
  });

  describe('getSurveysWithProgress', () => {
    it('should return all surveys with user progress', async () => {
      prismaService.survey.findMany.mockResolvedValue([mockSurvey]);

      const result = await service.getSurveysWithProgress('user-1');

      expect(result).toHaveLength(4); // BASIC, DERMATOLOGY, TRICHOLOGY, CLINICAL
      expect(result.find(s => s.type === 'BASIC')?.completed).toBe(true);
      expect(result.find(s => s.type === 'DERMATOLOGY')?.completed).toBe(false);
    });

    it('should calculate progress correctly', async () => {
      const partialSurvey = {
        ...mockSurvey,
        completedAt: null,
        answers: { gender: 'female' }, // Only 1 answer
      };
      prismaService.survey.findMany.mockResolvedValue([partialSurvey]);

      const result = await service.getSurveysWithProgress('user-1');

      const basicSurvey = result.find(s => s.type === 'BASIC');
      expect(basicSurvey?.progress).toBeGreaterThan(0);
      expect(basicSurvey?.progress).toBeLessThan(100);
    });

    it('should return 0 progress for unanswered surveys', async () => {
      prismaService.survey.findMany.mockResolvedValue([]);

      const result = await service.getSurveysWithProgress('user-1');

      expect(result.every(s => s.progress === 0)).toBe(true);
    });
  });

  describe('getSurvey', () => {
    it('should return single survey with questions', async () => {
      prismaService.survey.findUnique.mockResolvedValue(mockSurvey);

      const result = await service.getSurvey('user-1', 'BASIC' as SurveyType);

      expect(result.type).toBe('BASIC');
      expect(result.title).toBe('Базовый опрос');
      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.completed).toBe(true);
    });

    it('should throw NotFoundException for invalid survey type', async () => {
      // This test is tricky because TypeScript prevents invalid types
      // In practice, the service would handle this at runtime
      const invalidType = 'INVALID' as SurveyType;
      
      await expect(service.getSurvey('user-1', invalidType)).rejects.toThrow(NotFoundException);
    });
  });

  describe('submitSurvey', () => {
    it('should create new survey', async () => {
      prismaService.survey.findUnique.mockResolvedValue(null);
      prismaService.survey.create.mockResolvedValue(mockSurvey);

      const result = await service.submitSurvey('user-1', 'BASIC' as SurveyType, {
        answers: { gender: 'female', age_range: '25-34' },
        isComplete: false,
      });

      expect(result).toEqual(mockSurvey);
      expect(prismaService.survey.create).toHaveBeenCalled();
    });

    it('should update existing survey', async () => {
      prismaService.survey.findUnique.mockResolvedValue(mockSurvey);
      prismaService.survey.update.mockResolvedValue(mockSurvey);

      const result = await service.submitSurvey('user-1', 'BASIC' as SurveyType, {
        answers: { gender: 'male', age_range: '35-44' },
        isComplete: false,
      });

      expect(result).toEqual(mockSurvey);
      expect(prismaService.survey.update).toHaveBeenCalled();
    });

    it('should set completedAt when isComplete is true', async () => {
      prismaService.survey.findUnique.mockResolvedValue(null);
      prismaService.survey.create.mockResolvedValue(mockSurvey);

      // All required fields for BASIC survey
      await service.submitSurvey('user-1', 'BASIC' as SurveyType, {
        answers: {
          gender: 'FEMALE',
          age_range: '25-34',
          skin_type: 'NORMAL',
          main_concerns: ['acne'],
          skincare_goal: 'hydration',
        },
        isComplete: true,
      });

      expect(prismaService.survey.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            completedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should throw NotFoundException for invalid survey type', async () => {
      await expect(
        service.submitSurvey('user-1', 'INVALID' as SurveyType, {
          answers: {},
          isComplete: false,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSurvey', () => {
    it('should update existing survey', async () => {
      prismaService.survey.findUnique.mockResolvedValue(mockSurvey);
      prismaService.survey.update.mockResolvedValue(mockSurvey);

      const result = await service.updateSurvey('user-1', 'BASIC' as SurveyType, {
        answers: { gender: 'male' },
        isComplete: false,
      });

      expect(result).toEqual(mockSurvey);
    });

    it('should throw NotFoundException if survey not found', async () => {
      prismaService.survey.findUnique.mockResolvedValue(null);

      await expect(
        service.updateSurvey('user-1', 'BASIC' as SurveyType, {
          answers: {},
          isComplete: false,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSurvey', () => {
    it('should delete survey and regenerate prompt', async () => {
      prismaService.survey.deleteMany.mockResolvedValue({ count: 1 });
      prismaService.survey.findMany.mockResolvedValue([]);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue({} as any);

      await service.deleteSurvey('user-1', 'BASIC' as SurveyType);

      expect(prismaService.survey.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', type: 'BASIC' },
      });
    });
  });

  describe('getProgress', () => {
    it('should return progress for existing survey', async () => {
      prismaService.survey.findUnique.mockResolvedValue(mockSurvey);

      const result = await service.getProgress('user-1', 'BASIC' as SurveyType);

      expect(result.answers).toEqual(mockSurvey.answers);
      expect(result.progress).toBeGreaterThan(0);
      expect(result.lastUpdated).toEqual(mockSurvey.updatedAt);
    });

    it('should return empty progress for non-existent survey', async () => {
      prismaService.survey.findUnique.mockResolvedValue(null);

      const result = await service.getProgress('user-1', 'BASIC' as SurveyType);

      expect(result.answers).toBeNull();
      expect(result.progress).toBe(0);
      expect(result.lastUpdated).toBeNull();
    });

    it('should throw NotFoundException for invalid survey type', async () => {
      await expect(
        service.getProgress('user-1', 'INVALID' as SurveyType),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateSystemPrompt', () => {
    it('should generate prompt from completed surveys', async () => {
      prismaService.survey.findMany.mockResolvedValue([mockSurvey]);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.generateSystemPrompt('user-1');

      expect(result).toContain('консультант');
      expect(result).toContain('профилем');
    });

    it('should return empty string if no completed surveys', async () => {
      prismaService.survey.findMany.mockResolvedValue([]);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.generateSystemPrompt('user-1');

      expect(result).toBe('');
    });
  });

  describe('regenerateSystemPrompt', () => {
    it('should regenerate and save system prompt', async () => {
      prismaService.survey.findMany.mockResolvedValue([mockSurvey]);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue({} as any);

      const result = await service.regenerateSystemPrompt('user-1');

      expect(result).toContain('консультант');
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          systemPrompt: expect.any(String),
          systemPromptVersion: { increment: 1 },
        },
      });
    });
  });

  describe('hasCompletedSurveys', () => {
    it('should return completion status for all survey types', async () => {
      prismaService.survey.findMany.mockResolvedValue([
        { type: 'BASIC' },
        { type: 'DERMATOLOGY' },
      ]);

      const result = await service.hasCompletedSurveys('user-1');

      expect(result.basic).toBe(true);
      expect(result.dermatology).toBe(true);
      expect(result.trichology).toBe(false);
      expect(result.any).toBe(true);
    });

    it('should return false for all if no surveys completed', async () => {
      prismaService.survey.findMany.mockResolvedValue([]);

      const result = await service.hasCompletedSurveys('user-1');

      expect(result.basic).toBe(false);
      expect(result.dermatology).toBe(false);
      expect(result.trichology).toBe(false);
      expect(result.any).toBe(false);
    });
  });
});
