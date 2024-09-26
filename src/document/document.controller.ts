// document.controller.ts
import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Put, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { AllowedTypes } from 'src/decorators/allowed-types.decorator';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { HttpExceptionFilter } from 'src/filters/http-excpetion.filter';
import { Document } from '@prisma/client';

@Controller('documents')
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtAuthGuard)
@AllowedTypes("ADMIN")
export class DocumentController {
  constructor(private readonly documentService: DocumentService) { }

  @Post()
  async createDocument(@Body() createDocumentDto: CreateDocumentDto, @Res() res: Response): Promise<{
    statusCode?: number;
    data?: Document;
    message?: string;
  } | null> {
    const document = await this.documentService.createDocument(createDocumentDto);
    console.log('====================================');
    console.log(createDocumentDto);
    console.log('====================================');
    if (!document) {
      throw new BadRequestException("Failed to create Document", { cause: new Error(), description: 'Some error description' });
    }
    return res.status(HttpStatus.CREATED).send(document);
  }

  @Get()
  async getAllDocuments(@Res() res: Response) {
    const documents = await this.documentService.getAllDocuments();
    if (!documents || documents.length === 0) {
      throw new NotFoundException("No Documents found", { cause: new Error(), description: 'Some error description' });
    }
    return res.status(HttpStatus.OK).send(documents)
  }

  @Get(':id')
  async findOneDocument(@Param('id') id: number, @Res() res: Response) {

    const document = this.documentService.getDocumentById(id);
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`, { cause: new Error(), description: 'Some error description' });
    }
    return res.status(HttpStatus.OK).send(document)
  }

  @Put(':id')
  async updateDocument(@Param('id') id: number, @Body() updateDocumentDto: UpdateDocumentDto, @Res() res: Response) {
    const updatedDocument = this.documentService.updateDocument(id, updateDocumentDto);
    if (!updatedDocument) {
      throw new NotFoundException(`Document with ID ${id} not updated`, { cause: new Error(), description: 'Some error description' });
    }
    return res.status(HttpStatus.OK).send(updatedDocument)
  }

  @Delete(':id')
  async removeDocument(@Param('id') id: number, @Res() res: Response) {
    const document = this.documentService.deleteDocument(id);
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found or already removed`, { cause: new Error(), description: 'Some error description' });
    }
    return res.status(HttpStatus.OK).send(document)
  }
}
