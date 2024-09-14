import { Injectable } from '@nestjs/common';
import { CreateTypeDocumentDto } from './dto/create-type-document.dto';
import { UpdateTypeDocumentDto } from './dto/update-type-document.dto';

@Injectable()
export class TypeDocumentService {
  create(createTypeDocumentDto: CreateTypeDocumentDto) {
    return 'This action adds a new typeDocument';
  }

  findAll() {
    return `This action returns all typeDocument`;
  }

  findOne(id: number) {
    return `This action returns a #${id} typeDocument`;
  }

  update(id: number, updateTypeDocumentDto: UpdateTypeDocumentDto) {
    return `This action updates a #${id} typeDocument`;
  }

  remove(id: number) {
    return `This action removes a #${id} typeDocument`;
  }
}
