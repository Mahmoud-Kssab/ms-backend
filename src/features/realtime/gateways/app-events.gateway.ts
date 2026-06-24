import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_ORIGIN ?? 'http://127.0.0.1:3000',
    credentials: true,
  },
})
export class AppEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  handleConnection(client: Socket) {
    client.data.connectedAt = new Date().toISOString();
  }

  handleDisconnect(client: Socket) {
    delete client.data.connectedAt;
  }
}
