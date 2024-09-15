// src/users/dto/update-user.dto.ts
import { IsString, IsEmail, IsOptional, IsNotEmpty, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstname?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastname?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  telephone?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, {
    message: 'New password must be at least 8 characters long and include one uppercase letter, one lowercase letter, and one number',
  })
  newPassword?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  oldPassword?: string;
}
