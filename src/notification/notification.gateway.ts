import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * WebSocket gateway for pushing real‑time notifications to UI clients.
 * Listens on the `/notifications` namespace.
 */
@WebSocketGateway({ namespace: '/notifications', cors: true })
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Connection established – could log or perform auth if needed.
    // For now, no special handling.
  }

  handleDisconnect(client: Socket) {
    // Cleanup when a client disconnects.
  }

  /**
   * Broadcast a device update payload to all connected clients.
   */
  broadcastDeviceUpdate(data: any) {
    this.server.emit('deviceUpdate', data);
  }
}
