import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ApplicationModule } from './application/application.module';
import { DocumentModule } from './document/document.module';
import { TypeDocumentModule } from './type-document/type-document.module';
import { DestinationModule } from './destination/destination.module';
import { MessageModule } from './message/message.module';
import { RequestModule } from './request/request.module';
import { PrismaService } from './utils/prisma.service';
import { LoggerMiddleware } from './utils/logger.middleware';
import helmet from 'helmet';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UserModule, ApplicationModule, DocumentModule, TypeDocumentModule, DestinationModule, MessageModule, RequestModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, AuthService, UserService, JwtService],
  exports: [PrismaService, AuthModule]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(helmet(), LoggerMiddleware)
      .forRoutes({ path: '/user', method: RequestMethod.ALL });
  }
}
