import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TypeDocumentService } from './type-document.service';
import { CreateTypeDocumentDto } from './dto/create-type-document.dto';
import { UpdateTypeDocumentDto } from './dto/update-type-document.dto';

@Controller('type-document')
export class TypeDocumentController {
  constructor(private readonly typeDocumentService: TypeDocumentService) {}

  @Post()
  create(@Body() createTypeDocumentDto: CreateTypeDocumentDto) {
    return this.typeDocumentService.create(createTypeDocumentDto);
  }

  @Get()
  findAll() {
    return this.typeDocumentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeDocumentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTypeDocumentDto: UpdateTypeDocumentDto) {
    return this.typeDocumentService.update(+id, updateTypeDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typeDocumentService.remove(+id);
  }
}
