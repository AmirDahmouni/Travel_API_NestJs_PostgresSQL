import { IsString, IsInt, IsDateString, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

export class CreateRequestDto {
  @IsInt()
  @IsNotEmpty()
  visitorId: number;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  visit_to: string;

  @IsInt()
  @IsNotEmpty()
  LTN: number;

  @IsDateString()
  @IsNotEmpty()
  date_visit: string;

  @IsEnum(['pending', 'denied', 'approved'])
  status: string;
}
