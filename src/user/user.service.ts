import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma.service';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { User, UserStatus } from '@prisma/client';

@Injectable()
export class UserService {

  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { }


  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    if (!users) {
      throw new HttpException('Users not found', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async signIn(email: string, password: string): Promise<{ token: string; user: User }> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User is invalid!');
    }

    if (user.status === 'pending') {
      throw new UnauthorizedException('User not accepted yet');
    }
    if (user.status === 'refused') {
      throw new UnauthorizedException('User refused');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException('Password is invalid!');
    }

    const payload = { id: user.id, email: user.email, isAdmin: user.isAdmin };
    const token = this.jwtService.sign(payload);

    return { token, user };
  }

  async getPendingUsers(): Promise<Partial<User>[]> {
    const users = await this.prisma.user.findMany({
      where: {
        status: 'pending',
      },
      select: {
        firstname: true,
        lastname: true,
        type: true,
      },
    });

    if (!users || users.length === 0) {
      throw new HttpException('No pending users found', HttpStatus.NOT_FOUND);
    }

    return users;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async changeStatus(userId: number, newStatus: UserStatus): Promise<User> {
    // Update the user's status
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    // If the user is not found, throw a 404 error
    if (!updatedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return updatedUser;
  }

  async removeUser(userId: number): Promise<User> {
    // Find and delete the user
    const user = await this.prisma.user.delete({
      where: { id: userId },
    });

    // If the user is not found, throw a 404 error
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async update(id: number, updateUserData: any) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserData,
    });
  }

}
