import { IsString, IsEnum, IsArray, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateApplicationDto {
  @IsNotEmpty()
  destinationId: number;

  @IsNotEmpty()
  travelerId: number;

  @IsString()
  directory: string;

  @IsArray()
  documentIds: number[];

  @IsEnum(['pending', 'validated', 'accepted'])
  validated: string;

  @IsDateString()
  dateTime: string;
}
