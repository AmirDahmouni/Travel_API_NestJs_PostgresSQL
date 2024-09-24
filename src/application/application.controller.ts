// application.controller.ts
import { Controller, Post, Body, UseGuards, Req, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApplicationService } from './application.service';
import { JwtAuthGuard } from 'src/guards/auth.guard';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) { }

  @UseGuards(JwtAuthGuard)
  @Post('new')
  @UseInterceptors(FilesInterceptor('files'))
  async newApplication(@Req() req, @Body() body, @UploadedFiles() files) {
    return this.applicationService.createApplication(req, body, files);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update/:id')
  @UseInterceptors(FilesInterceptor('files'))
  async updateApplication(@Req() req, @Body() body, @UploadedFiles() files) {
    return this.applicationService.updateApplication(req, body, files);
  }
}
