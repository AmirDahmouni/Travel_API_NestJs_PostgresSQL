import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma.service';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { User, UserStatus, UserType } from '@prisma/client';
import { RegisterUserDto } from './dto/create-user.dto';

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

  async registerNewUser(registerUserDto: RegisterUserDto) {
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
    const newUser = await this.prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password: hashedPassword,
        telephone,
        isAdmin: isAdmin || false, // Set the user as admin if provided
        type: UserType.ADMIN_TRAV, // Example logic to set user type
      },
    });

    // Generate JWT token
    const token = this.jwtService.sign({ id: newUser.id, email: newUser.email });

    return {
      user: newUser,
      token,
    };
  }

  async signIn(email: string, password: string): Promise<{ token: string; user: User }> {
    const user = await this.findByEmail(email);
    if (!user) null
    if (user.status === 'pending' || user.status === 'refused') return null
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return null
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
    if (!users) {
      throw new BadRequestException('Something bad happened', { cause: new Error(), description: 'Some error description' });
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
