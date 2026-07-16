import { Module } from '@nestjs/common';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [MapsController],
  providers: [MapsService, PrismaService],
})
export class AppModule {}
