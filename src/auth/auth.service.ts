// src/auth/auth.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { JwtPayload } from './jwt-payload.interface';
import { User, UserStatus, UserType } from '@prisma/client';
import { RegisterUserDto } from 'src/user/dto/create-user.dto';
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/utils/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) { }

  async validateUser(payload: JwtPayload) {
    return this.userService.getUserById(payload.id);
  }


  async signup(registerUserDto: RegisterUserDto): Promise<{ token?: string; user?: User }> {
    const { email, firstname, lastname, password, telephone, isAdmin } = registerUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException("User already registred", { cause: new Error(), description: 'Some error description' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user in the database
    let data = {
      firstname,
      lastname,
      email,
      password: hashedPassword,
      telephone,
      isAdmin: isAdmin || false, // Set the user as admin if provided
      // Example logic to set user type
    }
    if (!isAdmin) data['type'] = registerUserDto.type;

    const newUser = await this.prisma.user.create({ data });
    // Generate JWT token
    const token = this.jwtService.sign({ id: newUser.id, email: newUser.email }, {
      secret: process.env.JWT_SECRET
    });

    return {
      user: newUser,
      token,
    };
  }

  async signIn(email: string, password: string): Promise<{ token?: string; user?: User, error?: String } | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) return null;
    if (user.status == UserStatus.refused || user.status == UserStatus.accepted) return { error: "pending user" }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return { error: "Password incorrect" }
    const payload = { id: user.id, email: user.email, isAdmin: user.isAdmin };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET
    });

    return { token, user };
  }
}
