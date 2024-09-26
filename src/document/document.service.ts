// document.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma.service';
import { Document } from '@prisma/client';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) { }

  async createDocument(inputDdata: CreateDocumentDto): Promise<Document> {
    return this.prisma.document.create({
      data: {
        typeId: inputDdata.type,
        path: inputDdata.path,
        applicationId: inputDdata.application,
      }
    });
  }

  async getAllDocuments() {
    return this.prisma.document.findMany({
      include: {
        type: true, // Include related TypeDocument
        application: true, // Include related Application
      },
    });
  }

  async getDocumentById(id: number) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        type: true,
        application: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async updateDocument(id: number, inputDdata: UpdateDocumentDto) {
    const documentExists = await this.prisma.document.findUnique({ where: { id } });

    if (!documentExists) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        typeId: inputDdata.type,
        path: inputDdata.path,
        applicationId: inputDdata.application,
      },
    });
  }

  async deleteDocument(id: number) {
    const documentExists = await this.prisma.document.findUnique({ where: { id } });

    if (!documentExists) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.delete({
      where: { id },
    });
  }
}
