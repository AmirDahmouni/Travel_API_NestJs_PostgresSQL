import { Controller, Get, Post, Body, Patch, Param, Delete, UseFilters, UseGuards, ParseIntPipe, Req, ValidationPipe, UsePipes, HttpStatus, Res, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { HttpExceptionFilter } from 'src/filters/http-excpetion.filter';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/signin.dto';
import { AuthService } from 'src/auth/auth.service';
import { Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserStatus } from "@prisma/client"

@Controller('user')
@UseGuards(JwtAuthGuard)
@UseFilters(HttpExceptionFilter)

export class UserController {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) { }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Post('signin')
  @UsePipes(new ValidationPipe({ transform: true })) // Apply the ValidationPipe
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    try {
      const { email, password } = signInDto;
      const { token, user } = await this.userService.signIn(email, password);

      return res
        .status(HttpStatus.OK)
        .header('x-auth-token', token)
        .header('access-control-expose-headers', 'x-auth-token')
        .json({ data: user, token });
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ error: error.message });
    }
  }

  @Get('pending')
  async getPendingUsers() {
    return this.userService.getPendingUsers();
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.userService.getUserById(id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    return req.user; // req.user will be populated with the validated user object
  }

  @Patch(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body('newStatus') newStatus: UserStatus,
  ) {
    const userId = parseInt(id);
    return this.userService.changeStatus(userId, newStatus);
  }

  @Delete(':id')
  async removeUser(@Param('id') id: string): Promise<User> {
    const userId = parseInt(id);
    return this.userService.removeUser(userId);
  }

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const { email, password } = body;

    const user = await this.userService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    const token = await this.authService.login(user);
    return res.status(HttpStatus.OK).json(token);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const user = await this.userService.getUserById(id);
      if (!user) return res.status(HttpStatus.BAD_REQUEST).json({ error: 'User not found!' });

      let password = user.password;

      if (updateUserDto.oldPassword && updateUserDto.newPassword) {
        const validPassword = await bcrypt.compare(updateUserDto.oldPassword, user.password);
        if (!validPassword) return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Old password is invalid!' });

        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(updateUserDto.newPassword, salt);
      }

      const { firstname, lastname, email, telephone } = updateUserDto;

      const updatedUser = await this.userService.update(id, {
        firstname,
        lastname,
        email,
        telephone,
        password
      });

      if (updatedUser) return res.status(HttpStatus.NO_CONTENT).send({ data: 'User data updated' });
      else return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Failed to update user data' });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  }


}
