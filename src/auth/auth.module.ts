// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module'; // Import UserModule if needed
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/utils/prisma.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'mySecretKey', // Use environment variable in production
      signOptions: { expiresIn: '1h' }, // Token expiration
    }),
    UserModule,
  ],
  providers: [UserService, PrismaService, AuthService]
})
export class AuthModule { }
