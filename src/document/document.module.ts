import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { PrismaService } from 'src/utils/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService, PrismaService, JwtService],
})
export class DocumentModule { }
