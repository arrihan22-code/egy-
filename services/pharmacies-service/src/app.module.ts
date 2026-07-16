import { Module } from '@nestjs/common';
import { PharmaciesController } from './pharmacies.controller';
import { PharmaciesService } from './pharmacies.service';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [PharmaciesController],
  providers: [PharmaciesService, PrismaService],
})
export class AppModule {}
