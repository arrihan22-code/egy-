import { Module } from '@nestjs/common';
import { TransportController } from './transport.controller';
import { TransportService } from './transport.service';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [TransportController],
  providers: [TransportService, PrismaService],
})
export class AppModule {}
