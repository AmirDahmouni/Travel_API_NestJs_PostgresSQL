import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserStatus } from '@prisma/client';

@Injectable()
export class UserService {

  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users;
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user;
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
    return users;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user
  }

  async changeStatus(userId: number, newStatus: UserStatus): Promise<User | null> {
    // Update the user's status
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });
    return updatedUser;
  }

  async removeUser(userId: number): Promise<User | null> {
    const user = await this.prisma.user.delete({
      where: { id: userId },
    });
    return user;
  }

  async update(id: number, updateUserData: any): Promise<User | null> {
    return this.prisma.user.update({
      where: { id },
      data: updateUserData,
    });
  }

}
