import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingDto, UpdateProfileDto } from './dto/onboarding.dto';
import { User } from '@prisma/client';

export interface OnboardingStatus {
  isComplete: boolean;
  currentStep: number;
  totalSteps: number;
  completedFields: string[];
  missingFields: string[];
  percentComplete: number;
}

@Injectable()
export class UserService {
  private readonly ONBOARDING_FIELDS = ['gender', 'dateOfBirth', 'skinType', 'hairType', 'skinProblems', 'allergies'];
  private readonly REQUIRED_FIELDS = ['skinType', 'hairType'];
  private readonly TOTAL_STEPS = 5;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user by ID
   */
  async findById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get onboarding status
   */
  async getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        onboardingCompleted: true,
        onboardingStep: true,
        gender: true,
        dateOfBirth: true,
        skinType: true,
        hairType: true,
        skinProblems: true,
        allergies: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const completedFields: string[] = [];
    const missingFields: string[] = [];

    for (const field of this.ONBOARDING_FIELDS) {
      const value = user[field as keyof typeof user];
      const hasValue = value !== null && value !== undefined && 
        (Array.isArray(value) ? value.length > 0 : true);

      if (hasValue) {
        completedFields.push(field);
      } else {
        missingFields.push(field);
      }
    }

    // Check if required fields are filled
    const requiredComplete = this.REQUIRED_FIELDS.every(field => completedFields.includes(field));

    return {
      isComplete: user.onboardingCompleted,
      currentStep: user.onboardingStep,
      totalSteps: this.TOTAL_STEPS,
      completedFields,
      missingFields,
      percentComplete: Math.round((completedFields.length / this.ONBOARDING_FIELDS.length) * 100),
    };
  }

  /**
   * Update onboarding data
   */
  async updateOnboarding(userId: string, dto: OnboardingDto): Promise<Omit<User, 'passwordHash'>> {
    const updateData: Record<string, unknown> = {};

    if (dto.gender !== undefined) updateData.gender = dto.gender;
    if (dto.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.skinType !== undefined) updateData.skinType = dto.skinType;
    if (dto.skinProblems !== undefined) updateData.skinProblems = dto.skinProblems;
    if (dto.hairType !== undefined) updateData.hairType = dto.hairType;
    if (dto.allergies !== undefined) updateData.allergies = dto.allergies;
    if (dto.onboardingStep !== undefined) updateData.onboardingStep = dto.onboardingStep;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(userId: string): Promise<Omit<User, 'passwordHash'>> {
    // First check if required fields are filled
    const status = await this.getOnboardingStatus(userId);
    
    const requiredComplete = this.REQUIRED_FIELDS.every(field => 
      status.completedFields.includes(field)
    );

    if (!requiredComplete) {
      throw new NotFoundException(
        `Заполните обязательные поля: ${this.REQUIRED_FIELDS.filter(f => !status.completedFields.includes(f)).join(', ')}`
      );
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: true,
        onboardingStep: this.TOTAL_STEPS,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Skip onboarding (set as complete without all fields)
   */
  async skipOnboarding(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: true,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Omit<User, 'passwordHash'>> {
    const updateData: Record<string, unknown> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;
    if (dto.gender !== undefined) updateData.gender = dto.gender;
    if (dto.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.skinType !== undefined) updateData.skinType = dto.skinType;
    if (dto.skinProblems !== undefined) updateData.skinProblems = dto.skinProblems;
    if (dto.hairType !== undefined) updateData.hairType = dto.hairType;
    if (dto.allergies !== undefined) updateData.allergies = dto.allergies;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
