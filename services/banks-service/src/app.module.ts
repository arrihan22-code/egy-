import { Module } from '@nestjs/common';
import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [BanksController],
  providers: [BanksService, PrismaService],
})
export class AppModule {}
