import { Module } from '@nestjs/common';
import { HospitalsController } from './hospitals.controller';
import { HospitalsService } from './hospitals.service';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [HospitalsController],
  providers: [HospitalsService, PrismaService],
})
export class AppModule {}
