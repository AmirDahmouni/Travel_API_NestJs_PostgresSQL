import { Module } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { DestinationController } from './destination.controller';
import { PrismaService } from 'src/utils/prisma.service';
@Module({
  controllers: [DestinationController],
  providers: [DestinationService, PrismaService],
})
export class DestinationModule { }
