import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { SurveysController } from './surveys.controller';
import { SurveysService } from './surveys.service';

@Module({
  imports: [CacheModule.register()],
  controllers: [SurveysController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}
