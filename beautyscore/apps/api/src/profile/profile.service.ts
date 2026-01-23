import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SurveysService } from '../surveys/surveys.service';
import { Gender, SkinType, HairType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export interface ProfileData {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  avatar: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  skinType: string | null;
  hairType: string | null;
  allergies: string[];
  onboardingCompleted: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  termsAcceptedAt: Date | null;
  marketingAcceptedAt: Date | null;
  createdAt: Date;
  surveys: {
    basic: boolean;
    dermatology: boolean;
    trichology: boolean;
  };
  systemPromptVersion: number;
}

export interface UpdateProfileDto {
  name?: string;
  avatar?: string;
  gender?: Gender;
  dateOfBirth?: string | Date;
  skinType?: SkinType;
  hairType?: HairType;
  allergies?: string[];
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly surveys: SurveysService,
  ) {}

  /**
   * GET /api/profile - Get user profile
   */
  async getProfile(userId: string): Promise<ProfileData> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const surveyStatus = await this.surveys.hasCompletedSurveys(userId);

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      avatar: user.avatar,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      skinType: user.skinType,
      hairType: user.hairType,
      allergies: user.allergies,
      onboardingCompleted: user.onboardingCompleted,
      emailVerified: !!user.emailVerified, // Convert DateTime to boolean
      phoneVerified: !!user.phoneVerified,
      termsAcceptedAt: user.termsAcceptedAt,
      marketingAcceptedAt: user.marketingAcceptedAt,
      createdAt: user.createdAt,
      surveys: surveyStatus,
      systemPromptVersion: user.systemPromptVersion,
    };
  }

  /**
   * PUT /api/profile - Update profile
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileData> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        avatar: dto.avatar,
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        skinType: dto.skinType,
        hairType: dto.hairType,
        allergies: dto.allergies,
      },
    });

    // Log audit
    await this.logAudit(userId, 'profile_updated', { ...dto });

    // Regenerate system prompt if skin/hair type changed
    if (dto.skinType || dto.hairType || dto.allergies) {
      await this.surveys.regenerateSystemPrompt(userId);
    }

    return this.getProfile(userId);
  }

  /**
   * PUT /api/profile/email - Change email
   */
  async updateEmail(
    userId: string,
    newEmail: string,
    password: string,
  ): Promise<{ message: string; verificationRequired: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Подтвердите пароль');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Неверный пароль');
    }

    // Check if email already taken
    const existing = await this.prisma.user.findUnique({
      where: { email: newEmail.toLowerCase() },
    });

    if (existing && existing.id !== userId) {
      throw new BadRequestException('Email уже используется');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail.toLowerCase(),
        emailVerified: null, // Require re-verification (null = not verified)
      },
    });

    await this.logAudit(userId, 'email_changed', { newEmail });

    return {
      message: 'Email обновлён. Требуется подтверждение.',
      verificationRequired: true,
    };
  }

  /**
   * PUT /api/profile/phone - Change phone
   */
  async updatePhone(
    userId: string,
    newPhone: string,
    password: string,
  ): Promise<{ message: string; verificationRequired: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Подтвердите пароль');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Неверный пароль');
    }

    // Normalize phone
    const normalized = newPhone.replace(/\D/g, '');

    // Check if phone already taken
    const existing = await this.prisma.user.findUnique({
      where: { phone: normalized },
    });

    if (existing && existing.id !== userId) {
      throw new BadRequestException('Телефон уже используется');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        phone: normalized,
        phoneVerified: null, // Reset verification
      },
    });

    await this.logAudit(userId, 'phone_changed', { newPhone: normalized });

    return {
      message: 'Телефон обновлён. Требуется подтверждение.',
      verificationRequired: true,
    };
  }

  /**
   * PUT /api/profile/password - Change password
   */
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Текущий пароль не установлен');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Неверный текущий пароль');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('Пароль должен быть минимум 8 символов');
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash },
    });

    await this.logAudit(userId, 'password_changed', {});

    return { message: 'Пароль успешно изменён' };
  }

  /**
   * DELETE /api/profile - Delete account (152-ФЗ compliance)
   */
  async deleteAccount(
    userId: string,
    password: string,
    confirmation: string,
  ): Promise<{ message: string; deletionDate: Date }> {
    if (confirmation !== 'DELETE') {
      throw new BadRequestException('Для удаления введите "DELETE"');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Verify password if set
    if (user.passwordHash) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        throw new UnauthorizedException('Неверный пароль');
      }
    }

    // Soft delete: mark for deletion in 30 days
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        // Anonymize data immediately
        email: `deleted_${userId}@beautyscore.local`,
        phone: null,
        name: 'Удалённый пользователь',
        avatar: null,
      },
    });

    await this.logAudit(userId, 'account_deleted', { scheduledDeletion: deletionDate });

    return {
      message: 'Аккаунт будет полностью удалён через 30 дней',
      deletionDate,
    };
  }

  /**
   * POST /api/profile/undo-delete - Undo account deletion (152-ФЗ: 30-day recovery window)
   */
  async undoDelete(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, deletedAt: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (!user.deletedAt) {
      throw new BadRequestException('Аккаунт не был удалён');
    }

    // Check if within 30-day window
    const now = new Date();
    const daysSinceDeletion = (now.getTime() - user.deletedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceDeletion > 30) {
      throw new BadRequestException('Срок восстановления аккаунта истёк');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: null,
      },
    });

    await this.logAudit(userId, 'account_restored', {});

    return { message: 'Аккаунт восстановлен' };
  }

  /**
   * GET /api/profile/export - Export all user data (152-ФЗ compliance)
   */
  async exportData(userId: string): Promise<{
    user: Record<string, unknown>;
    surveys: unknown[];
    shelf: unknown[];
    searchHistory: unknown[];
    feedback: unknown[];
    exportedAt: Date;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        gender: true,
        dateOfBirth: true,
        skinType: true,
        hairType: true,
        allergies: true,
        createdAt: true,
        termsAcceptedAt: true,
        marketingAcceptedAt: true,
      },
    });

    const surveys = await this.prisma.survey.findMany({
      where: { userId },
      select: {
        type: true,
        version: true,
        answers: true,
        completedAt: true,
        createdAt: true,
      },
    });

    const shelf = await this.prisma.userProduct.findMany({
      where: { userId },
      include: {
        product: { select: { name: true, brand: true } },
      },
    });

    const searchHistory = await this.prisma.searchHistory.findMany({
      where: { userId },
      select: {
        query: true,
        type: true,
        createdAt: true,
      },
    });

    const feedback = await this.prisma.feedback.findMany({
      where: { userId },
      select: {
        type: true,
        message: true,
        ticketId: true,
        createdAt: true,
      },
    });

    await this.logAudit(userId, 'data_exported', {});

    return {
      user: user as Record<string, unknown>,
      surveys,
      shelf,
      searchHistory,
      feedback,
      exportedAt: new Date(),
    };
  }

  /**
   * GET /api/profile/system-prompt - Get current system prompt (for debug)
   */
  async getSystemPrompt(userId: string): Promise<{
    prompt: string | null;
    version: number;
    lastUpdated: Date;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        systemPrompt: true,
        systemPromptVersion: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return {
      prompt: user.systemPrompt,
      version: user.systemPromptVersion,
      lastUpdated: user.updatedAt,
    };
  }

  /**
   * POST /api/profile/regenerate-prompt - Regenerate system prompt
   */
  async regeneratePrompt(userId: string): Promise<{
    message: string;
    version: number;
  }> {
    const prompt = await this.surveys.regenerateSystemPrompt(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { systemPromptVersion: true },
    });

    return {
      message: prompt ? 'Промпт обновлён' : 'Пройдите опросы для генерации промпта',
      version: user?.systemPromptVersion || 0,
    };
  }

  // Private helper: audit logging
  private async logAudit(
    userId: string,
    action: string,
    details: Record<string, unknown>,
  ): Promise<void> {
    try {
      // Note: AuditLog model should be added to schema
      // For now, just console log
      console.log(`[AUDIT] User ${userId}: ${action}`, details);
    } catch {
      // Ignore audit log errors
    }
  }
}
