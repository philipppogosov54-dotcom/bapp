import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { SurveyType, Survey, User } from '@prisma/client';
import { basicQuestions, BASIC_SURVEY_VERSION, SurveyQuestion } from './data/questions/basic';
import { dermatologyQuestions, DERMATOLOGY_SURVEY_VERSION } from './data/questions/dermatology';
import { trichologyQuestions, TRICHOLOGY_SURVEY_VERSION } from './data/questions/trichology';
import { SubmitSurveyDto } from './dto/submit-survey.dto';

export interface SurveyWithProgress {
  type: SurveyType;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  version: string;
  completed: boolean;
  completedAt: Date | null;
  progress: number; // 0-100
  answers: Record<string, string | string[]> | null;
}

@Injectable()
export class SurveysService {
  private readonly logger = new Logger(SurveysService.name);
  
  private readonly surveyConfigs: Record<SurveyType, {
    title: string;
    description: string;
    questions: SurveyQuestion[];
    version: string;
    unlocks: string[];
  }> = {
    BASIC: {
      title: 'Базовый опрос',
      description: 'Расскажите о себе для начала персонализации',
      questions: basicQuestions,
      version: BASIC_SURVEY_VERSION,
      unlocks: ['Базовый поиск', 'Базовые рекомендации'],
    },
    DERMATOLOGY: {
      title: 'Дерматология',
      description: 'Подробнее о вашей коже для точных рекомендаций',
      questions: dermatologyQuestions,
      version: DERMATOLOGY_SURVEY_VERSION,
      unlocks: ['Персональный поиск для кожи', 'Рекомендации по уходу за кожей'],
    },
    TRICHOLOGY: {
      title: 'Трихология',
      description: 'Расскажите о волосах для подбора средств',
      questions: trichologyQuestions,
      version: TRICHOLOGY_SURVEY_VERSION,
      unlocks: ['Персональный поиск для волос', 'Рекомендации по уходу за волосами'],
    },
    CLINICAL: {
      title: 'Клинический опрос',
      description: 'Дополнительная информация для максимальной точности',
      questions: [], // TODO: Add clinical questions
      version: '1.0',
      unlocks: ['Клинические рекомендации'],
    },
  };

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Get all surveys with user progress
   */
  async getSurveysWithProgress(userId: string): Promise<SurveyWithProgress[]> {
    const userSurveys = await this.prisma.survey.findMany({
      where: { userId },
    });

    const surveyMap = new Map(userSurveys.map(s => [s.type, s]));

    return Object.entries(this.surveyConfigs).map(([type, config]) => {
      const userSurvey = surveyMap.get(type as SurveyType);
      const answers = userSurvey?.answers as Record<string, string | string[]> | null;
      
      // Calculate progress
      const totalQuestions = config.questions.length;
      const answeredQuestions = answers ? Object.keys(answers).length : 0;
      const progress = totalQuestions > 0 
        ? Math.round((answeredQuestions / totalQuestions) * 100) 
        : 0;

      return {
        type: type as SurveyType,
        title: config.title,
        description: config.description,
        questions: config.questions,
        version: config.version,
        completed: !!userSurvey?.completedAt,
        completedAt: userSurvey?.completedAt || null,
        progress,
        answers,
      };
    });
  }

  /**
   * Get single survey with questions
   */
  async getSurvey(userId: string, type: SurveyType): Promise<SurveyWithProgress> {
    const config = this.surveyConfigs[type];
    if (!config) {
      throw new NotFoundException('Опрос не найден');
    }

    const userSurvey = await this.prisma.survey.findUnique({
      where: { userId_type: { userId, type } },
    });

    const answers = userSurvey?.answers as Record<string, string | string[]> | null;
    const totalQuestions = config.questions.length;
    const answeredQuestions = answers ? Object.keys(answers).length : 0;
    const progress = totalQuestions > 0 
      ? Math.round((answeredQuestions / totalQuestions) * 100) 
      : 0;

    return {
      type,
      title: config.title,
      description: config.description,
      questions: config.questions,
      version: config.version,
      completed: !!userSurvey?.completedAt,
      completedAt: userSurvey?.completedAt || null,
      progress,
      answers,
    };
  }

  /**
   * Submit or save survey progress
   */
  async submitSurvey(
    userId: string,
    type: SurveyType,
    dto: SubmitSurveyDto,
  ): Promise<Survey> {
    const config = this.surveyConfigs[type];
    if (!config) {
      throw new NotFoundException('Опрос не найден');
    }

    // Validate answers if completing
    if (dto.isComplete) {
      this.validateAnswers(config.questions, dto.answers);
    }

    const existingSurvey = await this.prisma.survey.findUnique({
      where: { userId_type: { userId, type } },
    });

    let result: Survey;
    
    if (existingSurvey) {
      // Update existing
      result = await this.prisma.survey.update({
        where: { id: existingSurvey.id },
        data: {
          answers: dto.answers,
          completedAt: dto.isComplete ? new Date() : existingSurvey.completedAt,
          version: config.version,
        },
      });
    } else {
      // Create new
      result = await this.prisma.survey.create({
        data: {
          userId,
          type,
          answers: dto.answers,
          completedAt: dto.isComplete ? new Date() : null,
          version: config.version,
        },
      });
    }

    // C-6: Invalidate LLM cache when survey is completed (profile changed)
    if (dto.isComplete) {
      await this.invalidateLlmCache(userId);
      this.logger.log(`LLM cache invalidated for user ${userId} after survey ${type} completion`);
    }

    return result;
  }

  /**
   * Update existing survey answers
   */
  async updateSurvey(
    userId: string,
    type: SurveyType,
    dto: SubmitSurveyDto,
  ): Promise<Survey> {
    const config = this.surveyConfigs[type];
    if (!config) {
      throw new NotFoundException('Опрос не найден');
    }

    const existingSurvey = await this.prisma.survey.findUnique({
      where: { userId_type: { userId, type } },
    });

    if (!existingSurvey) {
      throw new NotFoundException('Сначала пройдите опрос');
    }

    if (dto.isComplete) {
      this.validateAnswers(config.questions, dto.answers);
    }

    const result = await this.prisma.survey.update({
      where: { id: existingSurvey.id },
      data: {
        answers: dto.answers,
        completedAt: dto.isComplete ? new Date() : existingSurvey.completedAt,
        version: config.version,
      },
    });

    // C-6: Invalidate cache when survey answers change
    if (dto.isComplete || existingSurvey.completedAt) {
      await this.invalidateLlmCache(userId);
    }

    return result;
  }

  /**
   * Reset (delete) survey
   */
  async deleteSurvey(userId: string, type: SurveyType): Promise<void> {
    await this.prisma.survey.deleteMany({
      where: { userId, type },
    });

    // Regenerate system prompt and invalidate cache - C-6
    await this.invalidateLlmCache(userId);
  }

  /**
   * Get survey progress (for resume)
   */
  async getProgress(userId: string, type: SurveyType): Promise<{
    answers: Record<string, string | string[]> | null;
    progress: number;
    lastUpdated: Date | null;
  }> {
    const config = this.surveyConfigs[type];
    if (!config) {
      throw new NotFoundException('Опрос не найден');
    }

    const survey = await this.prisma.survey.findUnique({
      where: { userId_type: { userId, type } },
    });

    if (!survey) {
      return { answers: null, progress: 0, lastUpdated: null };
    }

    const answers = survey.answers as Record<string, string | string[]>;
    const totalQuestions = config.questions.length;
    const answeredQuestions = Object.keys(answers).length;
    const progress = Math.round((answeredQuestions / totalQuestions) * 100);

    return {
      answers,
      progress,
      lastUpdated: survey.updatedAt,
    };
  }

  /**
   * Generate system prompt from all completed surveys
   */
  async generateSystemPrompt(userId: string): Promise<string> {
    const surveys = await this.prisma.survey.findMany({
      where: { userId, completedAt: { not: null } },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, gender: true, dateOfBirth: true },
    });

    if (surveys.length === 0) {
      return '';
    }

    // Build profile from survey answers
    const profile: Record<string, unknown> = {};
    
    for (const survey of surveys) {
      const answers = survey.answers as Record<string, string | string[]>;
      for (const [key, value] of Object.entries(answers)) {
        profile[key] = value;
      }
    }

    // Generate prompt
    const prompt = `Ты — топ-уровень консультант по косметике с глубокими знаниями дерматологии и трихологии.

К тебе обратился клиент со следующим профилем:

**Основная информация:**
- Пол: ${this.getProfileValue(profile, 'gender', user?.gender)}
- Возраст: ${this.getProfileValue(profile, 'age_range')}
- Тип кожи: ${this.getProfileValue(profile, 'skin_type')}

**Проблемы кожи:**
${this.formatArray(profile['main_concerns'] as string[])}

**Чувствительность:** ${this.getProfileValue(profile, 'skin_sensitivity')}

**Известные аллергии:**
${this.formatArray(profile['allergies'] as string[])}

**Кожные заболевания:**
${this.formatArray(profile['skin_conditions'] as string[])}

**Используемые активные ингредиенты:**
${this.formatArray(profile['active_ingredients'] as string[])}

**Реакция на солнце:** ${this.getProfileValue(profile, 'sun_reaction')}

**Волосы:**
- Тип: ${this.getProfileValue(profile, 'hair_type')}
- Текстура: ${this.getProfileValue(profile, 'hair_texture')}
- Кожа головы: ${this.getProfileValue(profile, 'scalp_type')}
- Проблемы: ${this.formatArray(profile['hair_problems'] as string[])}
- Процедуры: ${this.formatArray(profile['hair_treatments'] as string[])}

**Цель ухода:** ${this.getProfileValue(profile, 'skincare_goal')}

На основе этого профиля:
1. Оценивай совместимость каждого продукта с профилем клиента
2. Учитывай возможные конфликты ингредиентов
3. Предупреждай об аллергенах
4. Давай персональные рекомендации
5. Объясняй, почему продукт подходит или не подходит`;

    return prompt;
  }

  /**
   * Regenerate and save system prompt
   */
  async regenerateSystemPrompt(userId: string): Promise<string> {
    const prompt = await this.generateSystemPrompt(userId);
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        systemPrompt: prompt,
        systemPromptVersion: { increment: 1 },
      },
    });

    return prompt;
  }

  /**
   * Update user profile from survey answers (skinType, hairType, etc.)
   */
  async updateUserProfileFromSurveys(userId: string): Promise<void> {
    const surveys = await this.prisma.survey.findMany({
      where: { userId, completedAt: { not: null } },
    });

    if (surveys.length === 0) return;

    const profileUpdates: Record<string, unknown> = {};
    
    // Map answers to user profile fields
    const answerToFieldMap: Record<string, { field: string; transform?: (v: string) => string }> = {
      'skin_type': { field: 'skinType', transform: (v) => v.toUpperCase() },
      'hair_type': { field: 'hairType', transform: (v) => v.toUpperCase() },
      'gender': { field: 'gender', transform: (v) => v.toUpperCase() },
    };

    for (const survey of surveys) {
      const answers = survey.answers as Record<string, string | string[]>;
      if (!answers) continue;
      
      for (const [answerKey, config] of Object.entries(answerToFieldMap)) {
        const value = answers[answerKey];
        if (value && typeof value === 'string') {
          profileUpdates[config.field] = config.transform ? config.transform(value) : value;
        }
      }

      // Handle allergies separately (array)
      if (answers['allergies'] && Array.isArray(answers['allergies'])) {
        profileUpdates['allergies'] = answers['allergies'];
      }
    }

    // Check if ALL required surveys are completed (BASIC + DERMATOLOGY + TRICHOLOGY)
    const completedTypes = new Set(surveys.map(s => s.type));
    const hasAllRequired = completedTypes.has('BASIC') && 
                           completedTypes.has('DERMATOLOGY') && 
                           completedTypes.has('TRICHOLOGY');
    
    // Only set onboardingCompleted when ALL surveys are done
    profileUpdates['onboardingCompleted'] = hasAllRequired;

    // Update user profile if we have any updates
    if (Object.keys(profileUpdates).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: profileUpdates,
      });
    }
  }

  /**
   * Check if user has completed required surveys
   */
  async hasCompletedSurveys(userId: string): Promise<{
    basic: boolean;
    dermatology: boolean;
    trichology: boolean;
    any: boolean;
  }> {
    const surveys = await this.prisma.survey.findMany({
      where: { userId, completedAt: { not: null } },
      select: { type: true },
    });

    const completed = new Set(surveys.map(s => s.type));

    return {
      basic: completed.has('BASIC'),
      dermatology: completed.has('DERMATOLOGY'),
      trichology: completed.has('TRICHOLOGY'),
      any: completed.size > 0,
    };
  }

  // Private helpers

  /**
   * Invalidate LLM cache for user - C-6
   * Called when survey is completed (profile changed, scores need recalculation)
   */
  private async invalidateLlmCache(userId: string): Promise<void> {
    try {
      // Get user's system prompt hash to invalidate relevant cache keys
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { systemPromptVersion: true },
      });

      if (!user) return;

      // In Redis, we'd use pattern matching to delete all user's cache keys
      // For cache-manager, we need to track keys or use a store that supports patterns
      // For now, we'll increment the system prompt version which changes the cache key hash
      
      // Also invalidate any product scores the user has viewed
      // The cache keys are based on systemPrompt hash, so regenerating the prompt
      // will effectively invalidate old cache entries
      
      await this.regenerateSystemPrompt(userId);
      
      // Reset cache explicitly if using redis store with pattern support
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cacheStore = (this.cacheManager as any).store as { keys?: (pattern: string) => Promise<string[]> };
      
      if (cacheStore.keys) {
        try {
          // Try to find and delete user-specific cache keys
          // This works with ioredis but may not work with all cache stores
          const keys = await cacheStore.keys(`llm:*`);
          for (const key of keys) {
            await this.cacheManager.del(key);
          }
          this.logger.debug(`Deleted ${keys.length} LLM cache keys`);
        } catch {
          // Fallback: cache will naturally expire or be invalidated by prompt hash change
          this.logger.debug('Cache store does not support pattern-based deletion');
        }
      }
    } catch (error) {
      this.logger.error('Failed to invalidate LLM cache', error);
      // Don't throw - cache invalidation failure shouldn't break survey submission
    }
  }

  private validateAnswers(
    questions: SurveyQuestion[],
    answers: Record<string, string | string[]>,
  ): void {
    for (const question of questions) {
      if (!question.required) continue;

      const answer = answers[question.id];
      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        throw new BadRequestException(`Ответьте на вопрос: ${question.question}`);
      }

      // Validate multiple answers max
      if (question.validation?.max && Array.isArray(answer)) {
        if (answer.length > question.validation.max) {
          throw new BadRequestException(
            `Выберите не более ${question.validation.max} вариантов`,
          );
        }
      }
    }
  }

  private getProfileValue(
    profile: Record<string, unknown>,
    key: string,
    fallback?: unknown,
  ): string {
    const value = profile[key] ?? fallback;
    if (!value) return 'Не указано';
    return String(value);
  }

  private formatArray(arr: string[] | undefined): string {
    if (!arr || arr.length === 0) return '- Не указано';
    return arr.map(item => `- ${item}`).join('\n');
  }
}
