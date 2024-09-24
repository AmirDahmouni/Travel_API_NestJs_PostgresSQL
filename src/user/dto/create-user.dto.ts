import { IsEmail, IsString, IsBoolean, IsOptional, MinLength, IsEnum, Matches } from 'class-validator';

enum UserType {
  SOS = 'SOS',
  VISITOR = 'VISITOR',
  TRAVELER = 'TRAVELER',
  ADMIN_TRAV = 'ADMIN_TRAV',
}

export class RegisterUserDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, {
    message: 'New password must be at least 8 characters long and include one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @IsString()
  telephone: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @IsEnum(UserType)
  @IsOptional()
  type?: UserType;
}
