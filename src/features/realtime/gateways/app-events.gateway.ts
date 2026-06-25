import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import type { MessageModel } from '../../conversations/models/message.model';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_ORIGIN ?? 'http://127.0.0.1:3000',
    credentials: true,
  },
})
export class AppEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server?: Server;

  handleConnection(client: Socket) {
    client.data.connectedAt = new Date().toISOString();
  }

  handleDisconnect(client: Socket) {
    delete client.data.connectedAt;
  }

  publishConversationMessage(conversationId: string, message: MessageModel) {
    this.server?.to('app:global').emit('conversation.message.created', {
      conversationId,
      message: message.toJSON(),
    });
  }
}
