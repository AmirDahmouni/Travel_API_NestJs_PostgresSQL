import { IsString, IsEnum, IsBoolean, IsArray, IsNotEmpty } from 'class-validator';

export class CreateTypeDocumentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['PDF', 'JPG', 'PNG'])
  extension: string;

  @IsBoolean()
  removed: boolean;

  @IsArray()
  @IsNotEmpty()
  destinationIds: number[]; // Array of related destination IDs
}
