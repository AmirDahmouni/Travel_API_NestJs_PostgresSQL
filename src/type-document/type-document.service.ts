import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma.service';
import { CreateTypeDocumentDto } from './dto/create-type-document.dto';

@Injectable()
export class TypeDocumentService {
  constructor(private readonly prisma: PrismaService) { }

  // Create a new TypeDocument
  async createTypeDocument(data: CreateTypeDocumentDto) {
    return this.prisma.typeDocument.create({
      data: {
        name: data.name,
        extension: data.extension,
        destinations: {
          connect: data.destinations.map(id => ({ id })),
        },
      },
    });
  }

  // Get all TypeDocuments (filtered by 'removed: false')
  async getAllTypeDocuments() {
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
