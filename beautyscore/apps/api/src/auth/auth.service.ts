import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';

export interface TokenPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  tokens: AuthTokens;
  isNewUser?: boolean;
}

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register new user with email and password
   */
  async register(dto: RegisterDto, ip: string, userAgent: string): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Starting registration for:', dto.email);
      
      // Check if email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });

      if (existingUser) {
        console.log('[AuthService] User already exists:', dto.email);
        throw new ConflictException('Пользователь с таким email уже существует');
      }

      // Hash password
      const rounds = parseInt(this.configService.get<string>('BCRYPT_ROUNDS', '12'), 10);
      console.log('[AuthService] Hashing password with rounds:', rounds);
      const passwordHash = await bcrypt.hash(dto.password, rounds);

      // Create user
      console.log('[AuthService] Creating user...');
      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.name,
          lastLoginAt: new Date(),
          lastLoginIp: ip,
        },
      });
      console.log('[AuthService] User created:', user.id);

      // Generate tokens
      console.log('[AuthService] Generating tokens...');
      const tokens = await this.generateTokens(user, ip, userAgent);
      console.log('[AuthService] Tokens generated');

      // Log audit
      await this.logAudit(user.id, 'REGISTER', 'User', user.id, ip, userAgent);
      console.log('[AuthService] Registration complete for:', user.id);

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        tokens,
      };
    } catch (error) {
      console.error('[AuthService] Registration error:', error);
      throw error;
    }
  }

  /**
   * Login with email and password
   */
  async login(dto: LoginDto, ip: string, userAgent: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(
        `Аккаунт заблокирован. Попробуйте через ${minutesLeft} минут`,
      );
    }

    // Check if user has password (might be OAuth-only user)
    if (!user.passwordHash) {
      throw new UnauthorizedException('Используйте вход через соцсеть');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed attempts
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Reset failed attempts on successful login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user, ip, userAgent);

    // Log audit
    await this.logAudit(user.id, 'LOGIN', 'User', user.id, ip, userAgent);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string, ip: string, userAgent: string): Promise<AuthTokens> {
    // Find refresh token in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Недействительный refresh token');
    }

    // Verify JWT
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh' || payload.sub !== storedToken.userId) {
        throw new UnauthorizedException('Недействительный refresh token');
      }
    } catch {
      throw new UnauthorizedException('Недействительный refresh token');
    }

    // Revoke old refresh token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    return this.generateTokens(storedToken.user, ip, userAgent);
  }

  /**
   * Logout - revoke refresh token
   */
  async logout(userId: string, refreshToken: string, ip: string, userAgent: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        token: refreshToken,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    await this.logAudit(userId, 'LOGOUT', 'User', userId, ip, userAgent);
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string, ip: string, userAgent: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    await this.logAudit(userId, 'LOGOUT_ALL', 'User', userId, ip, userAgent);
  }

  /**
   * Validate access token payload
   */
  async validateUser(payload: TokenPayload): Promise<User | null> {
    if (payload.type !== 'access') {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.deletedAt) {
      return null;
    }

    return user;
  }

  /**
   * Login or register via phone (after SMS verification)
   */
  async loginOrRegisterWithPhone(phone: string, ip: string, userAgent: string): Promise<AuthResponse> {
    // Find existing user by phone
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    let isNewUser = false;

    if (!user) {
      // Create new user
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          phone,
          phoneVerified: new Date(),
          lastLoginAt: new Date(),
          lastLoginIp: ip,
        },
      });

      // Log audit
      await this.logAudit(user.id, 'REGISTER_PHONE', 'User', user.id, ip, userAgent);
    } else {
      // Update existing user
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerified: user.phoneVerified || new Date(),
          lastLoginAt: new Date(),
          lastLoginIp: ip,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      // Log audit
      await this.logAudit(user.id, 'LOGIN_PHONE', 'User', user.id, ip, userAgent);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user, ip, userAgent);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      tokens,
      isNewUser,
    };
  }

  /**
   * Process VK ID SDK token and create session
   * This is called after frontend receives tokens from VK ID SDK
   * 
   * VK ID can provide: name, avatar, dateOfBirth, gender (if enabled in app settings)
   */
  async processVkIdToken(
    vkAccessToken: string,
    vkUserId: number,
    ip: string,
    userAgent: string,
  ): Promise<AuthResponse> {
    // Fetch user profile from VK API
    const vkProfile = await this.fetchVkProfile(vkAccessToken, vkUserId);

    // Find or create user with all available fields
    return this.findOrCreateOAuthUser(
      'vk',
      {
        providerId: vkUserId.toString(),
        email: vkProfile.email,
        name: vkProfile.name,
        avatar: vkProfile.avatar,
        dateOfBirth: vkProfile.dateOfBirth,
        gender: vkProfile.gender,
      },
      ip,
      userAgent,
    );
  }

  /**
   * Fetch VK user profile using access token
   * Fields: photo_200, first_name, last_name, bdate, sex
   */
  private async fetchVkProfile(accessToken: string, userId: number): Promise<{
    email?: string;
    name?: string;
    avatar?: string;
    dateOfBirth?: Date;
    gender?: 'MALE' | 'FEMALE';
  }> {
    try {
      // Get user info from VK API with all available fields
      const response = await fetch(
        `https://api.vk.com/method/users.get?user_ids=${userId}&fields=photo_200,first_name,last_name,bdate,sex&access_token=${accessToken}&v=5.131`
      );
      
      const data = await response.json();
      
      if (data.error) {
        console.error('VK API error:', data.error);
        return {};
      }

      const user = data.response?.[0];
      if (!user) {
        return {};
      }

      // Parse date of birth (VK format: D.M.YYYY or D.M)
      let dateOfBirth: Date | undefined;
      if (user.bdate) {
        const parts = user.bdate.split('.');
        if (parts.length === 3) {
          // Full date: D.M.YYYY
          const [day, month, year] = parts.map(Number);
          dateOfBirth = new Date(year, month - 1, day);
        }
        // If only D.M without year, we skip it
      }

      // Map VK sex to our Gender enum (1 = female, 2 = male, 0 = not specified)
      let gender: 'MALE' | 'FEMALE' | undefined;
      if (user.sex === 1) {
        gender = 'FEMALE';
      } else if (user.sex === 2) {
        gender = 'MALE';
      }

      return {
        name: [user.first_name, user.last_name].filter(Boolean).join(' '),
        avatar: user.photo_200,
        dateOfBirth,
        gender,
      };
    } catch (error) {
      console.error('Error fetching VK profile:', error);
      return {};
    }
  }

  /**
   * Find or create user via OAuth
   * Supports additional fields from Yandex ID: phone, dateOfBirth, gender
   */
  async findOrCreateOAuthUser(
    provider: 'vk' | 'yandex' | 'telegram',
    profileData: {
      providerId: string;
      email?: string;
      name?: string;
      avatar?: string;
      phone?: string;
      dateOfBirth?: Date;
      gender?: 'MALE' | 'FEMALE';
    },
    ip: string,
    userAgent: string,
  ): Promise<AuthResponse> {
    const providerIdField = `${provider}Id` as 'vkId' | 'yandexId' | 'telegramId';

    // Try to find existing user by provider ID
    let user = await this.prisma.user.findUnique({
      where: { [providerIdField]: profileData.providerId } as any,
    });

    let isNewUser = false;

    if (!user && profileData.email) {
      // Try to find user by email and link accounts
      user = await this.prisma.user.findUnique({
        where: { email: profileData.email.toLowerCase() },
      });

      if (user) {
        // Link OAuth account to existing user and update profile data
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            [providerIdField]: profileData.providerId,
            avatar: user.avatar || profileData.avatar,
            name: user.name || profileData.name,
            // Update additional fields only if not already set
            phone: user.phone || profileData.phone,
            phoneVerified: profileData.phone && !user.phone ? new Date() : user.phoneVerified,
            dateOfBirth: user.dateOfBirth || profileData.dateOfBirth,
            gender: user.gender || profileData.gender,
            lastLoginAt: new Date(),
            lastLoginIp: ip,
          },
        });

        await this.logAudit(user.id, `LINK_${provider.toUpperCase()}`, 'User', user.id, ip, userAgent);
      }
    }

    if (!user) {
      // Create new user with all available profile data
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          [providerIdField]: profileData.providerId,
          email: profileData.email?.toLowerCase(),
          emailVerified: profileData.email ? new Date() : null,
          name: profileData.name,
          avatar: profileData.avatar,
          phone: profileData.phone,
          phoneVerified: profileData.phone ? new Date() : null,
          dateOfBirth: profileData.dateOfBirth,
          gender: profileData.gender,
          lastLoginAt: new Date(),
          lastLoginIp: ip,
        },
      });

      await this.logAudit(user.id, `REGISTER_${provider.toUpperCase()}`, 'User', user.id, ip, userAgent);
    } else {
      // User exists - update last login
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          lastLoginIp: ip,
        },
      });

      await this.logAudit(user.id, `LOGIN_${provider.toUpperCase()}`, 'User', user.id, ip, userAgent);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user, ip, userAgent);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      tokens,
      isNewUser,
    };
  }

  // ============================================
  // EMAIL VERIFICATION
  // ============================================

  /**
   * Verify email address
   */
  async verifyEmail(userId: string, ip: string, userAgent: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });

    await this.logAudit(userId, 'EMAIL_VERIFIED', 'User', userId, ip, userAgent);
  }

  // ============================================
  // PASSWORD RESET
  // ============================================

  /**
   * Reset password with verified code
   */
  async resetPassword(
    email: string,
    newPassword: string,
    ip: string,
    userAgent: string,
  ): Promise<void> {
    const normalizedEmail = email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Hash new password
    const rounds = parseInt(this.configService.get<string>('BCRYPT_ROUNDS', '12'), 10);
    const passwordHash = await bcrypt.hash(newPassword, rounds);

    // Update password and reset security counters
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Revoke all refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.logAudit(user.id, 'PASSWORD_RESET', 'User', user.id, ip, userAgent);
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private async generateTokens(user: User, ip: string, userAgent: string): Promise<AuthTokens> {
    const accessPayload: TokenPayload = {
      sub: user.id,
      email: user.email || '',
      type: 'access',
    };

    const refreshPayload: TokenPayload = {
      sub: user.id,
      email: user.email || '',
      type: 'refresh',
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be configured in environment variables');
    }

    const accessToken = this.jwtService.sign(
      { sub: accessPayload.sub, email: accessPayload.email, type: accessPayload.type },
      {
        secret: jwtSecret,
        expiresIn: 900, // 15 minutes
      },
    );

    // Add unique jti (JWT ID) to prevent token collisions
    const jti = randomUUID();
    const refreshToken = this.jwtService.sign(
      { sub: refreshPayload.sub, email: refreshPayload.email, type: refreshPayload.type, jti },
      {
        secret: jwtRefreshSecret,
        expiresIn: 604800, // 7 days
      },
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        userAgent,
        ip,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private async handleFailedLogin(user: User): Promise<void> {
    const newAttempts = user.failedLoginAttempts + 1;
    const updateData: { failedLoginAttempts: number; lockedUntil?: Date } = {
      failedLoginAttempts: newAttempts,
    };

    // Lock account after max attempts
    if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
  }

  private async logAudit(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    ip: string,
    userAgent: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        ip,
        userAgent,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
  }
}
