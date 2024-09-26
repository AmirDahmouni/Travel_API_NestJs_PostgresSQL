import { IsInt, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsInt()
  type: number; // ID of the related TypeDocument

  @IsInt()
  application: number;

  @IsString()
  path: string; // Path for the document file
}