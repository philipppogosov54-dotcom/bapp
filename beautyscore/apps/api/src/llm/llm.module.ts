import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LlmService } from './llm.service';
import { GigaChatProvider } from './providers/gigachat.provider';
import { YandexGptProvider } from './providers/yandexgpt.provider';
import { CacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [ConfigModule, CacheModule.register()],
  providers: [LlmService, GigaChatProvider, YandexGptProvider],
  exports: [LlmService],
})
export class LlmModule {}
