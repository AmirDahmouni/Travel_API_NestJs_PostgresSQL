import { IsEmail, IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  telephone: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}
