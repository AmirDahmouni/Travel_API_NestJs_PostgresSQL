import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        imgSrc: [`'self'`, 'data:', ''],
        scriptSrc: [`'self'`, ``],
        manifestSrc: [`'self'`, ''],
        frameSrc: [`'self'`, ''],
      },
    },
  }));
  app.useStaticAssets(join(__dirname, '..', 'uploads'));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true, // Automatically remove properties that are not in the DTO
    forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are found
    skipMissingProperties: false, // Do not skip missing properties
  }));
  await app.listen(3000);
}
bootstrap();
