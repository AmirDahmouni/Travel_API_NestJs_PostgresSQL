import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessagingGateway } from './messaging.gateway';
import { PrismaService } from 'src/utils/prisma.service';

@Module({
  providers: [MessageService, MessagingGateway, PrismaService],
})
export class MessageModule { }
