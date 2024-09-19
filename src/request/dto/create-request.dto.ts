import { IsString, IsInt, IsDateString, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';

export class CreateRequestDto {
  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  visitorId: number;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @IsOptional()
  visit_to: string;

  @IsInt()
  @IsNotEmpty()
  LTN: number;

  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  date_visit: Date;

  @IsEnum(['pending', 'denied', 'approved'])
  @IsOptional()
  status: string;
}
