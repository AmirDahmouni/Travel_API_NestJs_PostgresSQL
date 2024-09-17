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
    return this.userService.getUserById(payload.id);
  }

  async login(user: any) {
    const payload: JwtPayload = { id: user.id, email: user.email, isAdmin: user.isAdmin, role: user.type };
    const token = await this.jwtService.signAsync(payload, { secret: process.env.JWT_SECRET });
    return {
      token
    };
  }
}
