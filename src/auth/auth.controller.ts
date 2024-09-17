import { Controller, Post, Body, UseFilters, ValidationPipe, UsePipes, HttpStatus, Res, InternalServerErrorException, HttpCode, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/filters/http-excpetion.filter';
import { Response } from 'express';
import { User } from "@prisma/client"
import { RegisterUserDto } from 'src/user/dto/create-user.dto';
import { SignInDto } from 'src/user/dto/signin.dto';
import { AuthService } from './auth.service';

@Controller('user')
@UseFilters(HttpExceptionFilter)

export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserDto: RegisterUserDto, @Res() res: Response): Promise<{
    statusCode: number;
    data?: User;
    message?: string;
  }> {
    const data = await this.authService.signup(registerUserDto);
    const { token, user } = data;
    return res.status(201).send({ token, user })
  }

  @Post('signin')
  @UsePipes(new ValidationPipe({ transform: true })) // Apply the ValidationPipe
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response): Promise<{
    statusCode: number;
    data?: User;
    message?: string;
  }> {
    try {
      const { email, password } = signInDto;
      const data = await this.authService.signIn(email, password);
      if (!data) throw new NotFoundException('user not found', { cause: new Error(), description: 'Some error description' })
      if (data.error) throw new UnauthorizedException(data.error, { cause: new Error(), description: 'Some error description' })

      const { token, user } = data

      return res
        .status(HttpStatus.OK)
        .header('x-auth-token', token)
        .header('access-control-expose-headers', 'x-auth-token')
        .json({ data: user, token });
    } catch (err) {
      throw new InternalServerErrorException(err.message, { cause: new Error(), description: 'Some error description' });
    }
  }

}
