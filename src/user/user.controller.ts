import { Controller, Get, Body, Patch, Param, Delete, UseFilters, UseGuards, ParseIntPipe, Req, ValidationPipe, UsePipes, HttpStatus, Res, Put, InternalServerErrorException } from '@nestjs/common';
import { UserService } from './user.service';
import { HttpExceptionFilter } from 'src/filters/http-excpetion.filter';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserStatus } from '@prisma/client';
import { AllowedTypes } from 'src/decorators/allowed-types.decorator';

@Controller('user')
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @AllowedTypes("ADMIN")
  @Get('')
  async findAll(@Res() res: Response): Promise<{
    statusCode: number;
    data?: User[];
    message?: string;
  }> {
    const users = await this.userService.findAll();
    const statusCode = users?.length > 0
      ? HttpStatus.OK
      : HttpStatus.NOT_FOUND;
    return res.status(statusCode).send(users)
  }

  @Get('profile')
  async getProfile(@Req() req, @Res() res: Response):
    Promise<{
      statusCode: number;
      data?: User;
      message?: string;
    }> {
    const user = await this.userService.getUserById(req.user.id);
    const statusCode = user ?
      HttpStatus.OK
      : HttpStatus.NOT_FOUND;
    return res.status(statusCode).send(user);
  }

  @Get('pending')
  async getPendingUsers(@Res() res: Response): Promise<{
    statusCode: number;
    data?: User[];
    message?: string;
  }> {
    const users = await this.userService.getPendingUsers();
    const statusCode = users?.length > 0
      ? HttpStatus.OK
      : HttpStatus.NOT_FOUND;
    return res.status(statusCode).send(users)
  }

  @Get(':id')
  async getUserById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Res() res: Response):
    Promise<{
      statusCode: number;
      data?: User;
      message?: string;
    }> {
    const user = await this.userService.getUserById(id);
    const statusCode = user ?
      HttpStatus.OK
      : HttpStatus.NOT_FOUND;
    return res.status(statusCode).send(user);
  }


  @Patch('status/:id')
  async changeStatus(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body('newStatus') newStatus: UserStatus,
    @Res() res: Response
  ) {
    const user = await this.userService.changeStatus(id, newStatus);
    const statusCode = user ? HttpStatus.OK : HttpStatus.NOT_MODIFIED;
    if (user)
      return res.status(statusCode).send(user);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response
  ): Promise<{
    statusCode: number;
    data?: User;
    message?: string;
  }> {
    const user = await this.userService.getUserById(id);
    if (!user) return res.status(HttpStatus.BAD_REQUEST).send({ error: 'User not found!' });

    let password = user.password;

    if (updateUserDto.oldPassword && updateUserDto.newPassword) {
      const validPassword = await bcrypt.compare(updateUserDto.oldPassword, user.password);
      if (!validPassword) return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Old password is invalid!' });

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

    if (updatedUser) return res.status(HttpStatus.ACCEPTED).send({ data: 'User data updated' });
    else return res.status(HttpStatus.BAD_REQUEST).send({ error: 'Failed to update user data' });
  }


  @Delete(':id')
  @AllowedTypes("ADMIN")
  async removeUser(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Res() res: Response):
    Promise<{
      statusCode: number;
      data?: User;
      message?: string;
    }> {
    const user = await this.userService.removeUser(id);
    return res.status(HttpStatus.ACCEPTED).send(user);
  }


}
