import { Controller, Get, Post, Param, Body, Patch, NotFoundException, InternalServerErrorException, UseFilters, UseGuards, BadRequestException, Res, HttpStatus, ParseIntPipe, Delete } from '@nestjs/common';
import { TypeDocumentService } from './type-document.service';
import { Prisma, TypeDocument } from '@prisma/client';
import { CreateTypeDocumentDto } from './dto/create-type-document.dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { HttpExceptionFilter } from 'src/filters/http-excpetion.filter';
import { Response } from 'express';
import { AllowedTypes } from 'src/decorators/allowed-types.decorator';

@Controller('type-documents')
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtAuthGuard)
@AllowedTypes("ADMIN")

export class TypeDocumentController {
  constructor(private readonly typeDocumentService: TypeDocumentService) { }

  @Post()
  async createTypeDocument(@Body() data: CreateTypeDocumentDto, @Res() res: Response): Promise<{
    statusCode?: number;
    data?: TypeDocument;
    message?: string;
  } | null> {
    const typeDocument = await this.typeDocumentService.createTypeDocument(data);
    if (!typeDocument) {
      throw new BadRequestException("Failed to create TypeDocument", { cause: new Error(), description: 'Some error description' });
    }
    return res.status(HttpStatus.CREATED).send(typeDocument);
  }

  @Get()
  async getAllTypeDocuments(@Res() res: Response): Promise<{
    statusCode?: number;
    data?: TypeDocument;
    message?: string;
  } | null> {
    const typesDocument = await this.typeDocumentService.getAllTypeDocuments();
    if (!typesDocument || typesDocument.length === 0) {
      throw new NotFoundException("No TypeDocuments found", { cause: new Error(), description: 'Some error description' });
    }
    return res.status(HttpStatus.OK).send(typesDocument)

  }

  @Get(':id')
  async getTypeDocumentById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Res() res: Response): Promise<{
    statusCode?: number;
    data?: TypeDocument;
    message?: string;
  } | null> {
    const typeDocument = await this.typeDocumentService.getTypeDocumentById(Number(id));
    if (!typeDocument) {

      throw new NotFoundException(`TypeDocument with ID ${id} not found`, { cause: new Error(), description: 'Some error description' });
    }
    return res.status(HttpStatus.OK).send(typeDocument)

  }

  @Delete(':id/remove')
  async removeTypeDocument(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Res() res: Response): Promise<{
    statusCode?: number;
    data?: TypeDocument;
    message?: string;
  } | null> {
    const typeDocument = await this.typeDocumentService.removeTypeDocument(Number(id));
    if (!typeDocument) {
      throw new NotFoundException(`TypeDocument with ID ${id} not found or already removed`, { cause: new Error(), description: 'Some error description' });
    }
    return res.status(HttpStatus.OK).send(typeDocument)
  }
}
