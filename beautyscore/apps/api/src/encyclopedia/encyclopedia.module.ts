import { Module } from '@nestjs/common';
import { EncyclopediaController } from './encyclopedia.controller';
import { EncyclopediaService } from './encyclopedia.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EncyclopediaController],
  providers: [EncyclopediaService],
  exports: [EncyclopediaService],
})
export class EncyclopediaModule {}
