import { Injectable, ExecutionContext, CallHandler } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Injectable()
export class DestinationFilesInterceptor {
  static getInterceptor(
    fieldName: string,
    maxCount: number,
    baseDestination: string,
    maxFileSize: number
  ) {
    return FilesInterceptor(fieldName, maxCount, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const folderName = req.body.directory;
          const dir = `${baseDestination}/${folderName}`;
          // Create directory if it doesn't exist
          fs.mkdir(dir, { recursive: true }, (err) => {
            if (err) {
              return cb(new Error('Failed to create directory'), dir);
            }
            cb(null, dir);
          });
        },
        filename: (req, file, cb) => {
          const fileIndex = Math.round(Math.random() * 1e9);
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExt = extname(file.originalname);
          const fileName = `${file.fieldname}-${fileIndex + 1}-${uniqueSuffix}${fileExt}`;

          if (!req.body.imagePaths) {
            req.body.imagePaths = [];
          }
          const folderName = req.body.directory;
          const filePath = `uploads/${folderName}/${fileName}`;
          req.body.imagePaths.push(filePath);

          cb(null, fileName);
        },
      }),
      limits: { fileSize: maxFileSize },
    });
  }
}
