
import { IsArray, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateDestinationDto {

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
  @IsOptional()
  imagePaths?: string[];

  @IsArray()
  @IsNotEmpty()
  typeDocumentsIds: number[];

  @IsArray()
  removedImages: string[];
}
