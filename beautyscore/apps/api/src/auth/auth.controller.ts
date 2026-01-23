import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService, AuthResponse, AuthTokens } from './auth.service';
import { SmsService } from './sms.service';
import { TelegramAuthService, TelegramAuthData } from './strategies/telegram.strategy';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { VerifySmsDto } from './dto/verify-sms.dto';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { VkTokenDto } from './dto/vk-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendCodeDto, ResendCodeType } from './dto/resend-code.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from './email.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  private readonly frontendUrl: string;

  constructor(
    private readonly authService: AuthService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
    private readonly telegramAuthService: TelegramAuthService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }

  /**
   * Register new user
   * Rate limited: 3 attempts per hour (temporarily disabled for debugging)
   */
  @Public()
  @Post('register')
  // @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: Omit<User, 'passwordHash'>; accessToken: string }> {
    console.log('[AuthController] Register called with:', dto.email);
    try {
      const ip = this.getClientIp(req);
      const userAgent = req.headers['user-agent'] || 'unknown';

      console.log('[AuthController] Calling authService.register...');
      const result = await this.authService.register(dto, ip, userAgent);

      // Set refresh token as httpOnly cookie
      this.setRefreshTokenCookie(res, result.tokens.refreshToken);

      console.log('[AuthController] Registration successful');
      return {
        user: result.user,
        accessToken: result.tokens.accessToken,
      };
    } catch (error) {
      console.error('[AuthController] Register error:', error);
      throw error;
    }
  }

  /**
   * Login with email and password
   * Rate limited: 5 attempts per 15 minutes
   */
  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: Omit<User, 'passwordHash'>; accessToken: string }> {
    const ip = this.getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await this.authService.login(dto, ip, userAgent);

    this.setRefreshTokenCookie(res, result.tokens.refreshToken);

    return {
      user: result.user,
      accessToken: result.tokens.accessToken,
    };
  }

  // ============================================
  // SMS AUTHENTICATION
  // ============================================

  /**
   * Send SMS verification code
   * Rate limited: 3 attempts per hour
   */
  @Public()
  @Post('sms/send')
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  async sendSmsCode(
    @Body() dto: SendSmsDto,
  ): Promise<{ codeId: string; expiresAt: Date; message: string }> {
    const result = await this.smsService.sendVerificationCode(dto.phone);
    return {
      ...result,
      message: 'Код отправлен на ваш номер телефона',
    };
  }

  /**
   * Verify SMS code and login/register
   */
  @Public()
  @Post('sms/verify')
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  @HttpCode(HttpStatus.OK)
  async verifySmsCode(
    @Body() dto: VerifySmsDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: Omit<User, 'passwordHash'>; accessToken: string; isNewUser: boolean }> {
    // Verify the SMS code
    const verifyResult = await this.smsService.verifyCode(dto.codeId, dto.code);

    // Login or register user with phone
    const ip = this.getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    const result = await this.authService.loginOrRegisterWithPhone(
      verifyResult.phone,
      ip,
      userAgent,
    );

    // Set refresh token cookie
    this.setRefreshTokenCookie(res, result.tokens.refreshToken);

    return {
      user: result.user,
      accessToken: result.tokens.accessToken,
      isNewUser: result.isNewUser || false,
    };
  }

  // ============================================
  // EMAIL VERIFICATION & PASSWORD RESET
  // ============================================

  /**
   * Send email verification code
   */
  @Public()
  @Post('verify-email/send')
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  async sendEmailVerificationCode(
    @Body('email') email: string,
  ): Promise<{ codeId: string; expiresAt: Date; message: string }> {
    const result = await this.emailService.sendVerificationCode(email);
    return {
      ...result,
      message: 'Код отправлен на ваш email',
    };
  }

  /**
   * Verify email with code
   */
  @Public()
  @Post('verify-email')
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string }> {
    const ip = this.getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await this.emailService.verifyCode(dto.codeId, dto.code);

    // Find user and mark email as verified
    const user = await this.authService['prisma'].user.findUnique({
      where: { email: result.email },
    });

    if (user) {
      await this.authService.verifyEmail(user.id, ip, userAgent);
    }

    return {
      success: true,
      message: 'Email успешно подтверждён',
    };
  }

  /**
   * Resend verification code (email or SMS)
   */
  @Public()
  @Post('resend-code')
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  async resendCode(
    @Body() dto: ResendCodeDto,
  ): Promise<{ codeId: string; expiresAt: Date; message: string }> {
    let result;

    switch (dto.type) {
      case ResendCodeType.EMAIL:
        result = await this.emailService.sendVerificationCode(dto.target);
        return { ...result, message: 'Код отправлен на email' };

      case ResendCodeType.PHONE:
        result = await this.smsService.sendVerificationCode(dto.target);
        return { ...result, message: 'Код отправлен на телефон' };

      case ResendCodeType.PASSWORD_RESET:
        result = await this.emailService.sendPasswordResetCode(dto.target);
        return { ...result, message: 'Код для сброса пароля отправлен' };

      default:
        throw new Error('Неизвестный тип кода');
    }
  }

  /**
   * Forgot password - send reset code
   */
  @Public()
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ codeId: string; expiresAt: Date; message: string }> {
    const result = await this.emailService.sendPasswordResetCode(dto.email);
    return {
      ...result,
      message: 'Если аккаунт существует, код отправлен на email',
    };
  }

  /**
   * Reset password with code
   */
  @Public()
  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string }> {
    const ip = this.getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Verify the code first
    const result = await this.emailService.verifyCode(dto.codeId, dto.code);

    // Reset the password
    await this.authService.resetPassword(result.email, dto.newPassword, ip, userAgent);

    return {
      success: true,
      message: 'Пароль успешно изменён',
    };
  }

  // ============================================
  // OAUTH AUTHENTICATION
  // ============================================

  /**
   * Initiate VK OAuth flow
   */
  @Public()
  @Get('vk')
  @UseGuards(AuthGuard('vk'))
  async vkAuth(): Promise<void> {
    // Passport redirects to VK
  }

  /**
   * VK OAuth callback (legacy, for passport flow)
   */
  @Public()
  @Get('vk/callback')
  @UseGuards(AuthGuard('vk'))
  async vkAuthCallback(
    @Req() req: Request & { user: any },
    @Res() res: Response,
  ): Promise<void> {
    await this.handleOAuthCallback('vk', req, res);
  }

  /**
   * VK ID SDK token exchange
   * Called from frontend after successful VK ID authentication
   */
  @Public()
  @Post('vk/token')
  @HttpCode(HttpStatus.OK)
  async vkIdToken(
    @Body() dto: VkTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: Omit<User, 'passwordHash'>; accessToken: string }> {
    const ip = this.getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await this.authService.processVkIdToken(
      dto.accessToken,
      dto.userId,
      ip,
      userAgent,
    );

    // Set refresh token cookie
    this.setRefreshTokenCookie(res, result.tokens.refreshToken);

    return {
      user: result.user,
      accessToken: result.tokens.accessToken,
    };
  }

  /**
   * Initiate Yandex OAuth flow
   */
  @Public()
  @Get('yandex')
  @UseGuards(AuthGuard('yandex'))
  async yandexAuth(): Promise<void> {
    // Passport redirects to Yandex
  }

  /**
   * Yandex OAuth callback
   */
  @Public()
  @Get('yandex/callback')
  @UseGuards(AuthGuard('yandex'))
  async yandexAuthCallback(
    @Req() req: Request & { user: any },
    @Res() res: Response,
  ): Promise<void> {
    await this.handleOAuthCallback('yandex', req, res);
  }

  /**
   * Telegram authentication (widget callback)
   */
  @Public()
  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  async telegramAuth(
    @Body() dto: TelegramAuthDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: Omit<User, 'passwordHash'>; accessToken: string; redirectUrl: string }> {
    // Verify Telegram auth data
    const telegramUser = this.telegramAuthService.verifyTelegramAuth(dto as TelegramAuthData);

    // Find or create user
    const ip = this.getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    const result = await this.authService.findOrCreateOAuthUser(
      'telegram',
      {
        providerId: telegramUser.providerId,
        name: telegramUser.name,
        avatar: telegramUser.avatar,
      },
      ip,
      userAgent,
    );

    // Set refresh token cookie
    this.setRefreshTokenCookie(res, result.tokens.refreshToken);

    // Determine redirect URL based on onboarding status
    const redirectUrl = result.user.onboardingCompleted
      ? `${this.frontendUrl}/app`
      : `${this.frontendUrl}/onboarding/welcome`;

    return {
      user: result.user,
      accessToken: result.tokens.accessToken,
      redirectUrl,
    };
  }

  /**
   * Telegram widget page (for iframe)
   */
  @Public()
  @Get('telegram/widget')
  async telegramWidget(@Res() res: Response): Promise<void> {
    const botUsername = this.configService.get<string>('TELEGRAM_BOT_USERNAME', 'BeautyScoreBot');
    const callbackUrl = `${this.frontendUrl}/auth/callback?provider=telegram`;
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Telegram Login</title>
          <script async src="https://telegram.org/js/telegram-widget.js?22"
            data-telegram-login="${botUsername}"
            data-size="large"
            data-radius="8"
            data-auth-url="${callbackUrl}"
            data-request-access="write">
          </script>
        </head>
        <body style="display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0;">
          <noscript>Please enable JavaScript to use Telegram Login.</noscript>
        </body>
      </html>
    `);
  }

  /**
   * Handle OAuth callback (helper for VK and Yandex)
   */
  private async handleOAuthCallback(
    provider: 'vk' | 'yandex',
    req: Request & { user: any },
    res: Response,
  ): Promise<void> {
    try {
      const ip = this.getClientIp(req);
      const userAgent = req.headers['user-agent'] || 'unknown';

      const result = await this.authService.findOrCreateOAuthUser(
        provider,
        {
          providerId: req.user.providerId,
          email: req.user.email,
          name: req.user.name,
          avatar: req.user.avatar,
          // Additional fields from Yandex ID
          phone: req.user.phone,
          dateOfBirth: req.user.dateOfBirth,
          gender: req.user.gender,
        },
        ip,
        userAgent,
      );

      // Set refresh token cookie
      this.setRefreshTokenCookie(res, result.tokens.refreshToken);

      // Redirect to frontend with access token and isNewUser flag
      const redirectUrl = result.user.onboardingCompleted
        ? '/app'
        : '/onboarding/welcome';

      res.redirect(
        `${this.frontendUrl}/auth/callback?` +
        `accessToken=${result.tokens.accessToken}&` +
        `isNewUser=${result.isNewUser || false}&` +
        `redirectUrl=${encodeURIComponent(redirectUrl)}`
      );
    } catch (error) {
      // Redirect to login with error
      res.redirect(
        `${this.frontendUrl}/login?error=${encodeURIComponent(error.message || 'OAuth authentication failed')}`
      );
    }
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  /**
   * Refresh access token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const ip = this.getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    const tokens = await this.authService.refreshTokens(refreshToken, ip, userAgent);

    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }

  /**
   * Logout from current device
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const refreshToken = req.cookies?.refreshToken;
    const ip = this.getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (refreshToken) {
      await this.authService.logout(user.id, refreshToken, ip, userAgent);
    }

    this.clearRefreshTokenCookie(res);

    return { message: 'Вы вышли из системы' };
  }

  /**
   * Logout from all devices
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const ip = this.getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    await this.authService.logoutAll(user.id, ip, userAgent);

    this.clearRefreshTokenCookie(res);

    return { message: 'Вы вышли из системы на всех устройствах' };
  }

  /**
   * Get current user profile
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async me(@CurrentUser() user: User): Promise<Omit<User, 'passwordHash'>> {
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from strict for cross-origin requests
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api', // Changed from /auth to work with all API endpoints
    });
  }

  private clearRefreshTokenCookie(res: Response): void {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api',
    });
  }
}
