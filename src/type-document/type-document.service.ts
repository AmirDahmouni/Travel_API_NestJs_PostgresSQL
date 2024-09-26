import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma.service';
import { CreateTypeDocumentDto } from './dto/create-type-document.dto';
import { DocumentExtension, TypeDocument } from '@prisma/client';

@Injectable()
export class TypeDocumentService {
  constructor(private readonly prisma: PrismaService) { }

  // Create a new TypeDocument
  async createTypeDocument(data: CreateTypeDocumentDto): Promise<TypeDocument | null> {
    console.log('====================================');
    console.log(data);
    console.log('====================================');
    return this.prisma.typeDocument.create({
      data: {
        name: data.name,
        extension: data.extension as DocumentExtension,
        removed: false,
      },
    });
  }

  // Get all TypeDocuments (filtered by 'removed: false')
  async getAllTypeDocuments(): Promise<TypeDocument[] | null> {
    return this.prisma.typeDocument.findMany({
      where: { removed: false },
      select: { id: true, name: true, extension: true, removed: true }, // Exclude destinations
    });
  }

  // Get a TypeDocument by ID
  async getTypeDocumentById(id: number) {
    return this.prisma.typeDocument.findUnique({
      where: { id },
    });
  }

  // Soft delete a TypeDocument (set removed = true)
  async removeTypeDocument(id: number) {
    return this.prisma.typeDocument.update({
      where: { id },
      data: { removed: true },
    });
  }
}
