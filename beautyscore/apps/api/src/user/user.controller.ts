import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService, OnboardingStatus } from './user.service';
import { OnboardingDto, UpdateProfileDto } from './dto/onboarding.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import type { User } from '@prisma/client';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get current user profile
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: User): Promise<Omit<User, 'passwordHash'>> {
    return this.userService.findById(user.id) as Promise<Omit<User, 'passwordHash'>>;
  }

  /**
   * Update user profile
   */
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    return this.userService.updateProfile(user.id, dto);
  }

  /**
   * Get onboarding status
   */
  @Get('onboarding/status')
  @HttpCode(HttpStatus.OK)
  async getOnboardingStatus(@CurrentUser() user: User): Promise<OnboardingStatus> {
    return this.userService.getOnboardingStatus(user.id);
  }

  /**
   * Update onboarding data
   */
  @Patch('onboarding')
  @HttpCode(HttpStatus.OK)
  async updateOnboarding(
    @CurrentUser() user: User,
    @Body() dto: OnboardingDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    return this.userService.updateOnboarding(user.id, dto);
  }

  /**
   * Complete onboarding
   */
  @Post('onboarding/complete')
  @HttpCode(HttpStatus.OK)
  async completeOnboarding(@CurrentUser() user: User): Promise<Omit<User, 'passwordHash'>> {
    return this.userService.completeOnboarding(user.id);
  }

  /**
   * Skip onboarding
   */
  @Post('onboarding/skip')
  @HttpCode(HttpStatus.OK)
  async skipOnboarding(@CurrentUser() user: User): Promise<Omit<User, 'passwordHash'>> {
    return this.userService.skipOnboarding(user.id);
  }
}
