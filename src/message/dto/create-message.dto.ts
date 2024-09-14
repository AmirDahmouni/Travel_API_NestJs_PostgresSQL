import { IsString, IsInt, IsBoolean, IsNotEmpty, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  @IsNotEmpty()
  applicationId: number;

  @IsInt()
  @IsNotEmpty()
  adminTravelerId: number;

  @IsInt()
  @IsNotEmpty()
  travelerId: number;

  @IsString()
  @MinLength(10)
  content: string;

  @IsBoolean()
  seen: boolean;
}
