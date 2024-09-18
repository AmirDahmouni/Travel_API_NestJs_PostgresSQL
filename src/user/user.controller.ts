import { Controller, Get, Post, Body, Patch, Param, Delete, UseFilters, UseGuards, ParseIntPipe, Req, ValidationPipe, UsePipes, HttpStatus, Res, Put, BadRequestException, InternalServerErrorException, HttpCode, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { HttpExceptionFilter } from 'src/filters/http-excpetion.filter';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminTypeGuard } from 'src/guards/adminType.guard';
import { User, UserStatus } from '@prisma/client';

@Controller('user')
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(AdminTypeGuard)
  @Get('')
  async findAll(@Res() res: Response): Promise<{
    statusCode: number;
    data?: User[];
    message?: string;
  }> {
    try {
      const users = await this.userService.findAll();
      const statusCode = users?.length > 0
        ? HttpStatus.OK
        : HttpStatus.NOT_FOUND;
      return res.status(statusCode).send(users)
    }
    catch (err) {
      throw new InternalServerErrorException(err.message, { cause: new Error(), description: 'Some error description' });
    }

  }

  @Get('pending')
  async getPendingUsers(@Res() res: Response): Promise<{
    statusCode: number;
    data?: User[];
    message?: string;
  }> {
    try {
      const users = await this.userService.getPendingUsers();
      const statusCode = users?.length > 0
        ? HttpStatus.OK
        : HttpStatus.NOT_FOUND;
      return res.status(statusCode).send(users)
    }
    catch (err) {
      throw new InternalServerErrorException(err.message, { cause: new Error(), description: 'Some error description' });
    }
  }

  @Get(':id')
  async getUserById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Res() res: Response): Promise<{
    statusCode: number;
    data?: User;
    message?: string;
  }> {
    try {
      const user = await this.userService.getUserById(id);
      const statusCode = user ?
        HttpStatus.OK
        : HttpStatus.NOT_FOUND;
      return res.status(statusCode).send(user);
    }
    catch (err) {
      throw new InternalServerErrorException(err.message, { cause: new Error(), description: 'Some error description' });
    }

  }

  @Get('profile')
  async getProfile(@Req() req) {
    return req.user; // req.user will be populated with the validated user object
  }
  @Patch(':id/status')
  async changeStatus(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
    @Body('newStatus') newStatus: UserStatus,
  ) {
    return this.userService.changeStatus(id, newStatus);
  }

  @UseGuards(AdminTypeGuard)
  @Delete(':id')
  async removeUser(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number): Promise<User> {
    try {
      const user = await this.userService.removeUser(id);
      return user;
    }
    catch (err) {
      throw new InternalServerErrorException(err.message, { cause: new Error(), description: "Internal server error" });
    }
  }



  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
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
