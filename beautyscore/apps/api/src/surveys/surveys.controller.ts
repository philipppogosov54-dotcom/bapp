import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SurveyType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { SurveysService, SurveyWithProgress } from './surveys.service';
import { SubmitSurveyDto } from './dto/submit-survey.dto';
import type { User } from '@prisma/client';

@Controller('surveys')
@UseGuards(JwtAuthGuard)
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  /**
   * GET /api/surveys
   * Get all surveys with user progress
   */
  @Get()
  async getSurveys(@CurrentUser() user: User) {
    const surveys = await this.surveysService.getSurveysWithProgress(user.id);
    const completed = await this.surveysService.hasCompletedSurveys(user.id);
    
    return {
      data: surveys,
      meta: {
        completedCount: surveys.filter(s => s.completed).length,
        totalCount: surveys.length,
        hasBasic: completed.basic,
        hasDermatology: completed.dermatology,
        hasTrichology: completed.trichology,
      },
    };
  }

  /**
   * GET /api/surveys/:type
   * Get single survey with questions
   */
  @Get(':type')
  async getSurvey(
    @CurrentUser() user: User,
    @Param('type') type: string,
  ) {
    const surveyType = this.validateSurveyType(type);
    const survey = await this.surveysService.getSurvey(user.id, surveyType);
    return { data: survey };
  }

  /**
   * POST /api/surveys/:type
   * Submit or save survey answers
   */
  @Post(':type')
  @HttpCode(HttpStatus.CREATED)
  async submitSurvey(
    @CurrentUser() user: User,
    @Param('type') type: string,
    @Body() dto: SubmitSurveyDto,
  ) {
    const surveyType = this.validateSurveyType(type);
    const survey = await this.surveysService.submitSurvey(user.id, surveyType, dto);
    
    // If completed: regenerate system prompt AND update user profile
    if (dto.isComplete) {
      await this.surveysService.regenerateSystemPrompt(user.id);
      await this.surveysService.updateUserProfileFromSurveys(user.id);
    }

    return {
      data: survey,
      message: dto.isComplete ? 'Опрос успешно завершён' : 'Прогресс сохранён',
    };
  }

  /**
   * PUT /api/surveys/:type
   * Update existing survey answers
   */
  @Put(':type')
  async updateSurvey(
    @CurrentUser() user: User,
    @Param('type') type: string,
    @Body() dto: SubmitSurveyDto,
  ) {
    const surveyType = this.validateSurveyType(type);
    const survey = await this.surveysService.updateSurvey(user.id, surveyType, dto);
    
    // Regenerate system prompt
    await this.surveysService.regenerateSystemPrompt(user.id);

    return {
      data: survey,
      message: 'Ответы обновлены',
    };
  }

  /**
   * DELETE /api/surveys/:type
   * Reset survey (delete answers)
   */
  @Delete(':type')
  @HttpCode(HttpStatus.OK)
  async deleteSurvey(
    @CurrentUser() user: User,
    @Param('type') type: string,
  ) {
    const surveyType = this.validateSurveyType(type);
    await this.surveysService.deleteSurvey(user.id, surveyType);
    
    return { success: true, message: 'Опрос сброшен' };
  }

  /**
   * GET /api/surveys/:type/progress
   * Get survey progress for resume
   */
  @Get(':type/progress')
  async getProgress(
    @CurrentUser() user: User,
    @Param('type') type: string,
  ) {
    const surveyType = this.validateSurveyType(type);
    const progress = await this.surveysService.getProgress(user.id, surveyType);
    return { data: progress };
  }

  // Private helper

  private validateSurveyType(type: string): SurveyType {
    const upperType = type.toUpperCase();
    if (!Object.values(SurveyType).includes(upperType as SurveyType)) {
      throw new Error(`Invalid survey type: ${type}`);
    }
    return upperType as SurveyType;
  }
}
