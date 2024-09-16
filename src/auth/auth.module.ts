// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module'; // Assuming you have a UserModule and UserService
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/utils/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')
      }),
    }),
    UserModule,  // Import the user module for user-related operations
  ],
  providers: [AuthService, JwtStrategy, PrismaService, UserService],
  exports: [AuthService],
})
export class AuthModule { }
