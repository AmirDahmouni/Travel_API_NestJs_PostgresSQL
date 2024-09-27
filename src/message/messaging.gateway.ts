import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/utils/prisma.service';
import { Message } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust as needed for your CORS policy
  },
})
export class MessagingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly prismaService: PrismaService) { }

  // Called when the gateway is initialized
  afterInit(server: Server) {
    console.log('WebSocket gateway initialized');
  }

  // Called when a client connects
  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  // Called when a client disconnects
  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  // Listen for incoming messages from clients
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { adminTravelerId: number; travelerId: number; content: string },
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const { adminTravelerId, travelerId, content } = data;

    // Save the message in the database using Prisma
    const newMessage: Message = await this.prismaService.message.create({
      data: {
        adminTravelerId,
        travelerId,
        content,
        applicationId: 1, // Assuming you're hardcoding applicationId for now; modify as needed
      },
    });

    // Emit the message back to the specific rooms or users (traveler and admin)
    this.server.to(`user_${adminTravelerId}`).emit('receiveMessage', newMessage);
    this.server.to(`user_${travelerId}`).emit('receiveMessage', newMessage);
  }

  // Join a room based on adminTravelerId or travelerId
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() data: { userId: number }, @ConnectedSocket() client: Socket): void {
    const { userId } = data;
    const roomName = `user_${userId}`;
    client.join(roomName); // Join the room
    console.log(`User with ID ${userId} joined room: ${roomName}`);
  }
}