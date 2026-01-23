import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ProfileService } from './profile.service';
import type { UpdateProfileDto } from './profile.service';
import { CurrentUser } from '../common/decorators/user.decorator';

/**
 * Profile Controller
 *
 * User profile management (152-ФЗ compliant)
 *
 * Endpoints:
 * - GET /api/profile - Get profile
 * - PUT /api/profile - Update profile
 * - PUT /api/profile/email - Change email
 * - PUT /api/profile/phone - Change phone
 * - PUT /api/profile/password - Change password
 * - DELETE /api/profile - Delete account (152-ФЗ)
 * - GET /api/profile/export - Export data (152-ФЗ)
 * - GET /api/profile/system-prompt - Get LLM prompt
 * - POST /api/profile/regenerate-prompt - Regenerate prompt
 */
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * GET /api/profile
   * Get user profile with survey status
   */
  @Get()
  async getProfile(@CurrentUser('id') userId: string) {
    return this.profileService.getProfile(userId);
  }

  /**
   * PUT /api/profile
   * Update profile data
   */
  @Put()
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(userId, dto);
  }

  /**
   * PUT /api/profile/email
   * Change email (requires password)
   */
  @Put('email')
  async updateEmail(
    @CurrentUser('id') userId: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    if (!email || !password) {
      throw new BadRequestException('Укажите email и пароль');
    }
    return this.profileService.updateEmail(userId, email, password);
  }

  /**
   * PUT /api/profile/phone
   * Change phone (requires password)
   */
  @Put('phone')
  async updatePhone(
    @CurrentUser('id') userId: string,
    @Body('phone') phone: string,
    @Body('password') password: string,
  ) {
    if (!phone || !password) {
      throw new BadRequestException('Укажите телефон и пароль');
    }
    return this.profileService.updatePhone(userId, phone, password);
  }

  /**
   * PUT /api/profile/password
   * Change password
   */
  @Put('password')
  async updatePassword(
    @CurrentUser('id') userId: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Укажите текущий и новый пароль');
    }
    return this.profileService.updatePassword(userId, currentPassword, newPassword);
  }

  /**
   * DELETE /api/profile
   * Delete account (152-ФЗ: soft delete with 30 days retention)
   */
  @Delete()
  async deleteAccount(
    @CurrentUser('id') userId: string,
    @Body('password') password: string,
    @Body('confirmation') confirmation: string,
  ) {
    return this.profileService.deleteAccount(userId, password, confirmation);
  }

  /**
   * POST /api/profile/undo-delete
   * Restore deleted account (within 30 days)
   */
  @Post('undo-delete')
  async undoDelete(@CurrentUser('id') userId: string) {
    return this.profileService.undoDelete(userId);
  }

  /**
   * GET /api/profile/export
   * Export all user data (152-ФЗ: право на получение данных)
   */
  @Get('export')
  @Throttle({ default: { ttl: 86400000, limit: 3 } }) // 3 per day
  async exportData(@CurrentUser('id') userId: string) {
    return this.profileService.exportData(userId);
  }

  /**
   * GET /api/profile/system-prompt
   * Get current LLM system prompt
   */
  @Get('system-prompt')
  async getSystemPrompt(@CurrentUser('id') userId: string) {
    return this.profileService.getSystemPrompt(userId);
  }

  /**
   * POST /api/profile/regenerate-prompt
   * Regenerate LLM system prompt from surveys
   */
  @Post('regenerate-prompt')
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 per minute
  async regeneratePrompt(@CurrentUser('id') userId: string) {
    return this.profileService.regeneratePrompt(userId);
  }
}
