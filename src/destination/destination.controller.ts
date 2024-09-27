import { Controller, Post, Body, Req, Res, Param, Get, Put, Delete, Query, UseInterceptors, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { Response } from 'express';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { DestinationFilesInterceptor } from 'src/interceptors/destination-upload.interceptor';

@Controller('destinations')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) { }

  @Post()
  @UseInterceptors(
    DestinationFilesInterceptor.getInterceptor('pictures', 10, './uploads/destinations', 5 * 1024 * 1024)
  )
  async createDestination(
    @Body() body: CreateDestinationDto,
    @Res() res: Response) {
    const data = await this.destinationService.createDestination(body, body.imagePaths)
    if (!data)
      throw new BadRequestException("Failed to create Destination", { cause: new Error(), description: 'Some error description' });
    else
      return res.status(HttpStatus.CREATED).send({ destination: data })
  }

  @Get(':id')
  async getDestinationById(@Param('id') id: number, @Res() res: Response) {
    const destination = await this.destinationService.getDestinationById(id);
    if (!destination)
      throw new NotFoundException(`Destination with ID ${id} not found`, { cause: new Error(), description: 'Some error description' });
    else
      return res.status(HttpStatus.FOUND).send({ data: destination });
  }

  @Get()
  async getAllDestinations(@Query('page') page = 1, @Query('keywords') keywords: string, @Res() res: Response) {
    const destinations = await this.destinationService.getAllDestinations(page, keywords);
    if (!destinations)
      throw new NotFoundException(`Destinations not found`, { cause: new Error(), description: 'Some error description' });
    else
      return res.status(HttpStatus.FOUND).send({ data: destinations });
  }

  @Put(':id')
  @UseInterceptors(
    DestinationFilesInterceptor.getInterceptor('pictures', 10, './uploads/destinations', 5 * 1024 * 1024)
  )
  async updateDestination(@Param('id') id: number, @Body() body: UpdateDestinationDto, @Res() res: Response) {
    const updatedDestination = await this.destinationService.updateDestination(id, body, body.imagePaths);
    if (!updatedDestination)
      throw new NotFoundException(`Destination not updated`, { cause: new Error(), description: 'Some error description' });
    return res.status(HttpStatus.ACCEPTED).send({ data: updatedDestination });
  }

  @Delete(':id')
  async removeDestination(@Param('id') id: number, @Res() res: Response) {
    const removedDestination = await this.destinationService.removeDestination(id);
    if (!removedDestination)
      throw new NotFoundException(`Destinations not found`, { cause: new Error(), description: 'Some error description' });
    return res.status(HttpStatus.ACCEPTED).send({ data: removedDestination });
  }
}
