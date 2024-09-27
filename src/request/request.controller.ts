import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpStatus, Res, InternalServerErrorException, NotFoundException, BadRequestException, UseGuards, Req, UseFilters } from '@nestjs/common';
import { RequestService } from './request.service';
import { Response } from 'express';
import { RequestStatus } from '@prisma/client';
import { UpdateRequestDto } from './dto/update-request.dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { AllowedTypes } from 'src/decorators/allowed-types.decorator';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';

@Controller('requests')
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtAuthGuard)

export class RequestController {
  constructor(private readonly requestService: RequestService) { }

  @Post()
  @AllowedTypes("VISITOR")
  async applyNewRequest(@Body() createRequestDto: UpdateRequestDto, @Res() res: Response) {
    try {
      const newRequest = await this.requestService.applyNewRequest(createRequestDto.visitorId, createRequestDto);
      return res.status(HttpStatus.CREATED).send({ data: newRequest });
    } catch (error) {
      throw new InternalServerErrorException(error.message, {
        cause: new Error(),
        description: 'Failed to create a new request.'
      });
    }
  }

  @Get("/status")
  @AllowedTypes("SOS")
  async getAllRequests(@Query('status') status: RequestStatus, @Res() res: Response) {
    try {
      const requests = await this.requestService.getAllRequests(status);
      return res.status(HttpStatus.OK).send({ data: requests });
    } catch (error) {
      throw new InternalServerErrorException(error.message, {
        cause: new Error(),
        description: 'Failed to fetch all requests due to an internal error.'
      });
    }
  }

  @Get('/visitor/:visitorId')
  @AllowedTypes("VISITOR")
  async getRequestsByVisitor(@Param('visitorId') visitorId: number, @Res() res: Response) {
    try {
      const requests = await this.requestService.getRequestsByVisitor(visitorId);
      return res.status(HttpStatus.OK).send({ data: requests });
    } catch (error) {
      throw new InternalServerErrorException(error.message, {
        cause: new Error(),
        description: 'Failed to fetch all requests due to an internal error.'
      });
    }
  }

  @Get(':id')
  async getRequestById(@Param('id') id: number, @Res() res: Response) {
    try {
      const request = await this.requestService.getRequestById(id);
      if (!request) {
        return res.status(HttpStatus.NOT_FOUND).send({ message: 'Request not found' });
      }
      return res.status(HttpStatus.OK).send({ data: request });
    } catch (error) {
      throw new InternalServerErrorException(error.message, {
        cause: new Error(),
        description: 'Failed to fetch the request by ID.'
      });
    }
  }

  @Put('/validate/:id/')
  @AllowedTypes("SOS")
  async validateRequest(@Param('id') id: number, @Body('status') status: RequestStatus, @Res() res: Response) {
    try {
      const validatedRequest = await this.requestService.validateRequest(id, status);
      if (!validatedRequest) {
        return res.status(HttpStatus.NOT_FOUND).send({ message: 'Request not found' });
      }
      return res.status(HttpStatus.ACCEPTED).send({ data: validatedRequest });
    } catch (error) {
      throw new InternalServerErrorException(error.message, {
        cause: new Error(),
        description: 'Failed to validate the request.'
      });
    }
  }

  @Delete(':id')
  async removeRequest(@Param('id') id: number, @Res() res: Response) {
    try {
      await this.requestService.removeRequest(id);
      return res.status(HttpStatus.OK).send({ message: 'Request removed' });
    } catch (error) {
      throw new InternalServerErrorException(error.message, {
        cause: new Error(),
        description: 'Failed to validate the request.'
      });
    }
  }
}
