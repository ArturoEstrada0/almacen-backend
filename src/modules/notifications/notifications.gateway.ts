import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Notification } from './entities/notification.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSocketMap: Map<string, Set<string>> = new Map();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store the socket for this user
      if (!this.userSocketMap.has(userId)) {
        this.userSocketMap.set(userId, new Set());
      }
      this.userSocketMap.get(userId).add(client.id);

      // Join user-specific room
      client.join(`user:${userId}`);
      client.data.userId = userId;

      console.log(`Client ${client.id} connected for user ${userId}`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId && this.userSocketMap.has(userId)) {
      const userSockets = this.userSocketMap.get(userId);
      userSockets.delete(client.id);
      
      if (userSockets.size === 0) {
        this.userSocketMap.delete(userId);
      }
    }
    console.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    return { event: 'subscribed', data: { userId } };
  }

  sendNotificationToUser(userId: string, notification: Notification) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  sendBulkNotificationsToUser(userId: string, notifications: Notification[]) {
    this.server.to(`user:${userId}`).emit('notifications:bulk', notifications);
  }

  broadcastToAllUsers(notification: any) {
    this.server.emit('notification:broadcast', notification);
  }
}
