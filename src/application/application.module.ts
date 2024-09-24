import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { PrismaService } from 'src/utils/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService, PrismaService, JwtService],
})
export class ApplicationModule { }
