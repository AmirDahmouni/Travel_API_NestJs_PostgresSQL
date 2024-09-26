import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { uploadFile } from 'src/helpers/UploadFile'; // Your custom upload helper

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const files = request.files; // Assuming files are part of the request (e.g., via Multer)
    const directory = request.body.directory; // You might get this from the body or elsewhere
    console.log('====================================');
    console.log(request.body);
    console.log('====================================');

    let paths: string[] = [];


    // Check if 'files.images' is an array
    if (Array.isArray(files)) {
      console.log('====================================');
      console.log(files);
      console.log('====================================');
      paths = await Promise.all(
        files.map(async (imageFile, index) => {

          try {
            imageFile.name = `${index + 1}.${imageFile.mimetype.split('/')[1]}`;
            const new_image = await uploadFile(`destinations/${directory}`, imageFile, 'image');
            if (new_image !== 'error') {
              return new_image;
            }
          } catch (error) {
            throw new BadRequestException(error.message, 'Failed to upload image');
          }
        }),
      );
    } else {
      try {
        files.images.name = `1.${files.images.mimetype.split('/')[1]}`;
        const new_image = await uploadFile(`destinations/${directory}`, files.images, 'image');
        if (new_image !== 'error') {
          paths.push(new_image);
        }
      } catch (error) {
        throw new BadRequestException(error.message, 'Failed to upload image');
      }
    }

    // Add the paths to the request body so the controller can access it
    request.body.imagePaths = paths;

    return next.handle(); // Proceed to the controller
  }
}
