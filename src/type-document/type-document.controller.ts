import { Controller, Get, Post, Param, Body, Patch, NotFoundException, InternalServerErrorException, UseFilters, UseGuards, BadRequestException, Res, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { TypeDocumentService } from './type-document.service';
import { Prisma, TypeDocument } from '@prisma/client';
import { CreateTypeDocumentDto } from './dto/create-type-document.dto';
import { AdminTravGuard } from 'src/guards/adminTrav.guard';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { HttpExceptionFilter } from 'src/filters/http-excpetion.filter';
import { Response } from 'express';

@Controller('type-documents')
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtAuthGuard, AdminTravGuard)
export class TypeDocumentController {
  constructor(private readonly typeDocumentService: TypeDocumentService) { }

  @Post()
  async createTypeDocument(@Body() data: CreateTypeDocumentDto, @Res() res: Response): Promise<{
    statusCode?: number;
    data?: TypeDocument;
    message?: string;
  } | null> {
    try {
      const typeDocument = await this.typeDocumentService.createTypeDocument(data);
      if (!typeDocument) {
        throw new BadRequestException("Failed to create TypeDocument", { cause: new Error(), description: 'Some error description' });
      }
      return res.status(HttpStatus.CREATED).send(typeDocument);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get()
  async getAllTypeDocuments(@Res() res: Response): Promise<{
    statusCode?: number;
    data?: TypeDocument;
    message?: string;
  } | null> {
    try {
      const typesDocument = await this.typeDocumentService.getAllTypeDocuments();
      if (!typesDocument || typesDocument.length === 0) {
        throw new BadRequestException("No TypeDocuments found", { cause: new Error(), description: 'Some error description' });
      }
      return res.status(HttpStatus.OK).send(typesDocument)
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get(':id')
  async getTypeDocumentById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Res() res: Response): Promise<{
    statusCode?: number;
    data?: TypeDocument;
    message?: string;
  } | null> {
    try {
      const typeDocument = await this.typeDocumentService.getTypeDocumentById(Number(id));
      if (!typeDocument) {
        throw new BadRequestException(`TypeDocument with ID ${id} not found`, { cause: new Error(), description: 'Some error description' });
      }
      return res.status(HttpStatus.OK).send(typeDocument)
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch(':id/remove')
  async removeTypeDocument(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Res() res: Response): Promise<{
    statusCode?: number;
    data?: TypeDocument;
    message?: string;
  } | null> {
    try {
      const typeDocument = await this.typeDocumentService.removeTypeDocument(Number(id));
      if (!typeDocument) {
        throw new NotFoundException(`TypeDocument with ID ${id} not found or already removed`, { cause: new Error(), description: 'Some error description' });
      }
      return res.status(HttpStatus.OK).send(typeDocument)
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
