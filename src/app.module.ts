import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ApplicationModule } from './application/application.module';
import { DocumentModule } from './document/document.module';
import { TypeDocumentModule } from './type-document/type-document.module';
import { DestinationModule } from './destination/destination.module';
import { MessageModule } from './message/message.module';
import { RequestModule } from './request/request.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [UserModule, ApplicationModule, DocumentModule, TypeDocumentModule, DestinationModule, MessageModule, RequestModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService]
})
export class AppModule { }
