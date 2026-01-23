import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SurveysModule } from './surveys/surveys.module';
import { EncyclopediaModule } from './encyclopedia/encyclopedia.module';
import { LlmModule } from './llm/llm.module';
import { SearchModule } from './search/search.module';
import { ProductsModule } from './products/products.module';
import { ShelfModule } from './shelf/shelf.module';
import { TrendsModule } from './trends/trends.module';
import { ProfileModule } from './profile/profile.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FeedbackModule } from './feedback/feedback.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { LoggingInterceptor } from './common/interceptors';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting (global) - relaxed for development/testing
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: process.env.NODE_ENV === 'production' ? 3 : 100,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: process.env.NODE_ENV === 'production' ? 20 : 500,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: process.env.NODE_ENV === 'production' ? 100 : 1000,
      },
    ]),

    // Database
    PrismaModule,

    // Auth
    AuthModule,

    // User
    UserModule,

    // Surveys
    SurveysModule,

    // Encyclopedia (public product/ingredient database)
    EncyclopediaModule,

    // LLM Integration (GigaChat + YandexGPT)
    LlmModule,

    // Personalized Search
    SearchModule,

    // Products with personalized scores
    ProductsModule,

    // User's product shelf
    ShelfModule,

    // Product trends
    TrendsModule,

    // User profile (152-ФЗ compliant)
    ProfileModule,

    // Notifications
    NotificationsModule,

    // Feedback
    FeedbackModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global logging interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global rate limiter
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global JWT auth guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
