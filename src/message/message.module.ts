import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessagingGateway } from './messaging.gateway';
import { MessageController } from './message.controller';


@Module({
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule { }
