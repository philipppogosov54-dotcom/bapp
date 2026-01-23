import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    name: 'Test User',
    phone: null,
    phoneVerified: null,
    emailVerified: null,
    avatar: null,
    gender: null,
    dateOfBirth: null,
    vkId: null,
    yandexId: null,
    telegramId: null,
    systemPrompt: null,
    onboardingCompleted: false,
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: new Date(),
    lastLoginIp: '127.0.0.1',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokens = {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock_token'),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config: Record<string, string> = {
          BCRYPT_ROUNDS: '10',
          JWT_SECRET: 'test_secret',
          JWT_REFRESH_SECRET: 'test_refresh_secret',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Setup bcrypt mocks
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);
      prismaService.refreshToken.create.mockResolvedValue({} as any);
      prismaService.auditLog.create.mockResolvedValue({} as any);

      const result = await service.register(
        { email: 'test@example.com', password: 'password123', name: 'Test User' },
        '127.0.0.1',
        'Mozilla/5.0',
      );

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens).toBeDefined();
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(prismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register(
          { email: 'test@example.com', password: 'password123', name: 'Test User' },
          '127.0.0.1',
          'Mozilla/5.0',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should normalize email to lowercase', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);
      prismaService.refreshToken.create.mockResolvedValue({} as any);
      prismaService.auditLog.create.mockResolvedValue({} as any);

      await service.register(
        { email: 'TEST@EXAMPLE.COM', password: 'password123', name: 'Test User' },
        '127.0.0.1',
        'Mozilla/5.0',
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUser);
      prismaService.refreshToken.create.mockResolvedValue({} as any);
      prismaService.auditLog.create.mockResolvedValue({} as any);

      const result = await service.login(
        { email: 'test@example.com', password: 'password123' },
        '127.0.0.1',
        'Mozilla/5.0',
      );

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login(
          { email: 'wrong@example.com', password: 'password123' },
          '127.0.0.1',
          'Mozilla/5.0',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      prismaService.user.update.mockResolvedValue(mockUser);

      await expect(
        service.login(
          { email: 'test@example.com', password: 'wrong_password' },
          '127.0.0.1',
          'Mozilla/5.0',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for locked account', async () => {
      const lockedUser = {
        ...mockUser,
        lockedUntil: new Date(Date.now() + 60000), // Locked for 1 minute
      };
      prismaService.user.findUnique.mockResolvedValue(lockedUser);

      await expect(
        service.login(
          { email: 'test@example.com', password: 'password123' },
          '127.0.0.1',
          'Mozilla/5.0',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for OAuth-only user', async () => {
      const oauthUser = { ...mockUser, passwordHash: null };
      prismaService.user.findUnique.mockResolvedValue(oauthUser);

      await expect(
        service.login(
          { email: 'test@example.com', password: 'password123' },
          '127.0.0.1',
          'Mozilla/5.0',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reset failed attempts on successful login', async () => {
      const userWithFailedAttempts = { ...mockUser, failedLoginAttempts: 3 };
      prismaService.user.findUnique.mockResolvedValue(userWithFailedAttempts);
      prismaService.user.update.mockResolvedValue(mockUser);
      prismaService.refreshToken.create.mockResolvedValue({} as any);
      prismaService.auditLog.create.mockResolvedValue({} as any);

      await service.login(
        { email: 'test@example.com', password: 'password123' },
        '127.0.0.1',
        'Mozilla/5.0',
      );

      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginAttempts: 0,
            lockedUntil: null,
          }),
        }),
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const storedToken = {
        id: 'token-1',
        token: 'refresh_token',
        userId: 'user-1',
        user: mockUser,
        expiresAt: new Date(Date.now() + 86400000),
        revokedAt: null,
      };
      prismaService.refreshToken.findUnique.mockResolvedValue(storedToken);
      jwtService.verify.mockReturnValue({ sub: 'user-1', type: 'refresh' });
      prismaService.refreshToken.update.mockResolvedValue({} as any);
      prismaService.refreshToken.create.mockResolvedValue({} as any);

      const result = await service.refreshTokens('refresh_token', '127.0.0.1', 'Mozilla/5.0');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(prismaService.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { revokedAt: expect.any(Date) },
        }),
      );
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      prismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        service.refreshTokens('invalid_token', '127.0.0.1', 'Mozilla/5.0'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for revoked token', async () => {
      const revokedToken = {
        id: 'token-1',
        token: 'refresh_token',
        userId: 'user-1',
        user: mockUser,
        expiresAt: new Date(Date.now() + 86400000),
        revokedAt: new Date(),
      };
      prismaService.refreshToken.findUnique.mockResolvedValue(revokedToken);

      await expect(
        service.refreshTokens('refresh_token', '127.0.0.1', 'Mozilla/5.0'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const expiredToken = {
        id: 'token-1',
        token: 'refresh_token',
        userId: 'user-1',
        user: mockUser,
        expiresAt: new Date(Date.now() - 86400000), // Expired yesterday
        revokedAt: null,
      };
      prismaService.refreshToken.findUnique.mockResolvedValue(expiredToken);

      await expect(
        service.refreshTokens('refresh_token', '127.0.0.1', 'Mozilla/5.0'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should revoke refresh token', async () => {
      prismaService.refreshToken.updateMany.mockResolvedValue({ count: 1 });
      prismaService.auditLog.create.mockResolvedValue({} as any);

      await service.logout('user-1', 'refresh_token', '127.0.0.1', 'Mozilla/5.0');

      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          token: 'refresh_token',
          revokedAt: null,
        },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('logoutAll', () => {
    it('should revoke all refresh tokens', async () => {
      prismaService.refreshToken.updateMany.mockResolvedValue({ count: 5 });
      prismaService.auditLog.create.mockResolvedValue({} as any);

      await service.logoutAll('user-1', '127.0.0.1', 'Mozilla/5.0');

      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          revokedAt: null,
        },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('validateUser', () => {
    it('should return user for valid access token payload', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser({
        sub: 'user-1',
        email: 'test@example.com',
        type: 'access',
      });

      expect(result).toEqual(mockUser);
    });

    it('should return null for refresh token type', async () => {
      const result = await service.validateUser({
        sub: 'user-1',
        email: 'test@example.com',
        type: 'refresh',
      });

      expect(result).toBeNull();
    });

    it('should return null for deleted user', async () => {
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      prismaService.user.findUnique.mockResolvedValue(deletedUser);

      const result = await service.validateUser({
        sub: 'user-1',
        email: 'test@example.com',
        type: 'access',
      });

      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser({
        sub: 'user-1',
        email: 'test@example.com',
        type: 'access',
      });

      expect(result).toBeNull();
    });
  });

  describe('loginOrRegisterWithPhone', () => {
    it('should create new user for new phone', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);
      prismaService.refreshToken.create.mockResolvedValue({} as any);
      prismaService.auditLog.create.mockResolvedValue({} as any);

      const result = await service.loginOrRegisterWithPhone(
        '+79991234567',
        '127.0.0.1',
        'Mozilla/5.0',
      );

      expect(result.isNewUser).toBe(true);
      expect(prismaService.user.create).toHaveBeenCalled();
    });

    it('should login existing user with phone', async () => {
      const existingUser = { ...mockUser, phone: '+79991234567' };
      prismaService.user.findUnique.mockResolvedValue(existingUser);
      prismaService.user.update.mockResolvedValue(existingUser);
      prismaService.refreshToken.create.mockResolvedValue({} as any);
      prismaService.auditLog.create.mockResolvedValue({} as any);

      const result = await service.loginOrRegisterWithPhone(
        '+79991234567',
        '127.0.0.1',
        'Mozilla/5.0',
      );

      expect(result.isNewUser).toBeFalsy();
      expect(prismaService.user.update).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUser);
      prismaService.refreshToken.updateMany.mockResolvedValue({ count: 3 });
      prismaService.auditLog.create.mockResolvedValue({} as any);

      await service.resetPassword(
        'test@example.com',
        'new_password',
        '127.0.0.1',
        'Mozilla/5.0',
      );

      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: expect.any(String),
            failedLoginAttempts: 0,
            lockedUntil: null,
          }),
        }),
      );
      // Should revoke all tokens for security
      expect(prismaService.refreshToken.updateMany).toHaveBeenCalled();
    });

    it('should not throw for non-existent user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      // Should not throw - don't reveal if user exists
      await expect(
        service.resetPassword(
          'nonexistent@example.com',
          'new_password',
          '127.0.0.1',
          'Mozilla/5.0',
        ),
      ).resolves.not.toThrow();
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      prismaService.user.update.mockResolvedValue(mockUser);
      prismaService.auditLog.create.mockResolvedValue({} as any);

      await service.verifyEmail('user-1', '127.0.0.1', 'Mozilla/5.0');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { emailVerified: expect.any(Date) },
      });
    });
  });

  describe('findOrCreateOAuthUser', () => {
    it('should create new user for new OAuth provider', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);
      prismaService.refreshToken.create.mockResolvedValue({} as any);
      prismaService.auditLog.create.mockResolvedValue({} as any);

      const result = await service.findOrCreateOAuthUser(
        'vk',
        {
          providerId: '12345',
          email: 'test@example.com',
          name: 'Test User',
          avatar: 'https://example.com/avatar.jpg',
        },
        '127.0.0.1',
        'Mozilla/5.0',
      );

      expect(result.isNewUser).toBe(true);
      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            vkId: '12345',
            email: 'test@example.com',
          }),
        }),
      );
    });

    it('should link OAuth to existing user with same email', async () => {
      prismaService.user.findUnique
        .mockResolvedValueOnce(null) // First call: check by vkId
        .mockResolvedValueOnce(mockUser); // Second call: check by email
      prismaService.user.update.mockResolvedValue(mockUser);
      prismaService.refreshToken.create.mockResolvedValue({} as any);
      prismaService.auditLog.create.mockResolvedValue({} as any);

      const result = await service.findOrCreateOAuthUser(
        'vk',
        {
          providerId: '12345',
          email: 'test@example.com',
          name: 'Test User',
        },
        '127.0.0.1',
        'Mozilla/5.0',
      );

      expect(result.isNewUser).toBeFalsy();
      expect(prismaService.user.update).toHaveBeenCalled();
    });

    it('should login existing OAuth user', async () => {
      const existingOAuthUser = { ...mockUser, vkId: '12345' };
      prismaService.user.findUnique.mockResolvedValue(existingOAuthUser);
      prismaService.user.update.mockResolvedValue(existingOAuthUser);
      prismaService.refreshToken.create.mockResolvedValue({} as any);
      prismaService.auditLog.create.mockResolvedValue({} as any);

      const result = await service.findOrCreateOAuthUser(
        'vk',
        { providerId: '12345' },
        '127.0.0.1',
        'Mozilla/5.0',
      );

      expect(result.isNewUser).toBeFalsy();
    });
  });
});
