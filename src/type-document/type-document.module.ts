import { Module } from '@nestjs/common';
import { TypeDocumentService } from './type-document.service';
import { TypeDocumentController } from './type-document.controller';
import { PrismaService } from 'src/utils/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [TypeDocumentController],
  providers: [TypeDocumentService, PrismaService, JwtService],
})
export class TypeDocumentModule { }
