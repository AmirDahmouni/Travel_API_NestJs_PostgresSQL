import { IsString, IsArray, IsBoolean, IsNotEmpty, MinLength } from 'class-validator';

export class CreateDestinationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()
  @IsNotEmpty()
  directory: string;

  @IsArray()
  imagePaths: string[];

  @IsArray()
  @IsNotEmpty()
  typeDocumentsIds: number[]; // Array of TypeDocument IDs

}
