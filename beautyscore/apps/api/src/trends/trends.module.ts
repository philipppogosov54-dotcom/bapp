import { Module } from '@nestjs/common';
import { TrendsController } from './trends.controller';
import { TrendsService } from './trends.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SurveysModule } from '../surveys/surveys.module';

@Module({
  imports: [PrismaModule, SurveysModule],
  controllers: [TrendsController],
  providers: [TrendsService],
  exports: [TrendsService],
})
export class TrendsModule {}
