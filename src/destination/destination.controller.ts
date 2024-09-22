import { Controller, Post, Body, Req, Res, Param, Get, Put, Delete, Query, InternalServerErrorException, UseInterceptors, MaxFileSizeValidator, UploadedFile, ParseFilePipe, BadRequestException, UploadedFiles, HttpCode, HttpStatus } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('destinations')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/destinations', // Destination directory
      filename: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
      },
    }),
  }))
  async createDestination(
    @Body() body: any,
    @UploadedFiles(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 1000 }),  // Ensure file size validation
      ],
    })) files: Array<Express.Multer.File> | Express.Multer.File, @Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.destinationService.createDestination(body, files)
      if (!data)
        throw new BadRequestException("Failed to create TypeDocument", { cause: new Error(), description: 'Some error description' });
      else
        return res.status(HttpStatus.CREATED).send({ destination: data })
    }
    catch (err) {
      throw new InternalServerErrorException(err.message, { cause: new Error(), description: "Internal server error" });
    }
  }

  @Get(':id')
  async getDestinationById(@Param('id') id: number, @Res() res: Response) {
    try {
      const destination = await this.destinationService.getDestinationById(id);
      return res.status(200).send({ data: destination });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get()
  async getAllDestinations(@Query('page') page = 1, @Query('keywords') keywords: string, @Res() res: Response) {
    try {
      const destinations = await this.destinationService.getAllDestinations(page, keywords);
      return res.status(HttpStatus.ACCEPTED).send({ data: destinations });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Put(':id')
  async updateDestination(@Param('id') id: number, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    try {
      const updatedDestination = await this.destinationService.updateDestination(id, body, req.files);
      return res.status(202).send({ data: updatedDestination });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  async removeDestination(@Param('id') id: number, @Res() res: Response) {
    try {
      const removedDestination = await this.destinationService.removeDestination(id);
      return res.status(200).send({ data: removedDestination });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
