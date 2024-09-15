// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(payload: JwtPayload) {
    // Validate the user based on the payload from the token
    return await this.userService.getUserById(payload.id);
  }

  async login(user: any) {
    // Create JWT token for the user
    const payload: JwtPayload = { id: user.id, email: user.email, isAdmin: user.isAdmin };
    return {
      access_token: this.jwtService.signAsync(payload, { secret: process.env.JWT_SECRET }),
    };
  }
}
