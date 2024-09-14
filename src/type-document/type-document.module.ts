import { Module } from '@nestjs/common';
import { TypeDocumentService } from './type-document.service';
import { TypeDocumentController } from './type-document.controller';

@Module({
  controllers: [TypeDocumentController],
  providers: [TypeDocumentService],
})
export class TypeDocumentModule {}
