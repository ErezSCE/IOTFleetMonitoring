import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';

/**
 * NotificationModule bundles the WebSocket gateway and the Redis subscription
 * service that forwards device updates to connected UI clients.
 */
@Module({
  providers: [NotificationGateway, NotificationService],
})
export class NotificationModule {}
