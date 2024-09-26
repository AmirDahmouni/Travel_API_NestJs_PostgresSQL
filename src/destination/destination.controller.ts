import { Controller, Post, Body, Req, Res, Param, Get, Put, Delete, Query, InternalServerErrorException, UseInterceptors, MaxFileSizeValidator, UploadedFile, ParseFilePipe, BadRequestException, UploadedFiles, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { Request, Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreateDestinationDto } from './dto/create-destination.dto';
import path, { extname } from 'path';
import * as fs from 'fs';
import { NotFoundError } from 'rxjs';

@Controller('destinations')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) { }

  @Post()
  @UseInterceptors(
    FilesInterceptor('pictures', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const folderName = req.body.directory;
          const dir = `./uploads/destinations/${folderName}`
          // Check if the directory exists, create it if it doesn't
          fs.mkdir(dir, { recursive: true }, (err) => {
            if (err) {
              return cb(new Error('Failed to create directory'), dir);
            }
            cb(null, dir); // Specify your destination folder for file uploads
          });
        },
        filename: (req, file, cb) => {
          // Use index from req.fileIndex
          const fileIndex = Math.round(Math.random() * 1e9); // Start from 0 if fileIndex is undefined
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExt = extname(file.originalname); // Use extname for original file extension

          // Create a filename with the index
          const fileName = `${file.fieldname}-${fileIndex + 1}-${uniqueSuffix}${fileExt}`;
          if (!req.body.imagePaths) {
            req.body.imagePaths = [];
          }

          // Append the new image path to req.body.imagePaths
          const filePath = `destinations/${req.body.name}/${fileName}`
          req.body.imagePaths.push(filePath);

          cb(null, fileName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
    }),
  )
  async createDestination(
    @Body() body: CreateDestinationDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
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
  async updateDestination(@Param('id') id: number, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const updatedDestination = await this.destinationService.updateDestination(id, body, req.files);
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
