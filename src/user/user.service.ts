import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserStatus, UserType } from '@prisma/client';

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
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
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
    if (!users) {
      throw new BadRequestException('Something bad happened', { cause: new Error(), description: 'Some error description' });
    }
    return users;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user
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
    const user = await this.prisma.user.delete({
      where: { id: userId },
    });
    return user;
  }

  async update(id: number, updateUserData: any) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserData,
    });
  }

}
