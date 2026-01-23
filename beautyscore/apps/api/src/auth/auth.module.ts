import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { VkStrategy } from './strategies/vk.strategy';
import { YandexStrategy } from './strategies/yandex.strategy';
import { TelegramAuthService } from './strategies/telegram.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: {
          expiresIn: 900, // 15 minutes in seconds
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SmsService,
    EmailService,
    JwtStrategy,
    VkStrategy,
    YandexStrategy,
    TelegramAuthService,
    JwtAuthGuard,
  ],
  exports: [AuthService, SmsService, EmailService, TelegramAuthService, JwtAuthGuard],
})
export class AuthModule {}
