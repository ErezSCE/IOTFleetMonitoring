import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { NotificationGateway } from './notification.gateway';

/**
 * Service that subscribes to Redis Pub/Sub channel for device updates
 * and forwards them to connected WebSocket clients via the gateway.
 */
@Injectable()
export class NotificationService implements OnModuleInit, OnModuleDestroy {
  private redisSubscriber!: Redis;
  private readonly channel = 'device-updates';

  constructor(private readonly gateway: NotificationGateway) {}

  onModuleInit() {
    // Initialize Redis client for subscription
    this.redisSubscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT as string, 10) || 6379,
    });

    this.redisSubscriber.subscribe(this.channel, (err, count) => {
      if (err) {
        // In production we would use structured logging; for now console.error
        console.error('Failed to subscribe to Redis channel', err);
      } else {
        console.log(`Subscribed to ${this.channel}, ${count} total subscriptions`);
      }
    });

    this.redisSubscriber.on('message', (channel: string, message: string) => {
      if (channel === this.channel) {
        let payload: any;
        try {
          payload = JSON.parse(message);
        } catch (e) {
          console.error('Invalid JSON payload from Redis', e);
          return;
        }
        this.gateway.broadcastDeviceUpdate(payload);
      }
    });
  }

  onModuleDestroy() {
    if (this.redisSubscriber) {
      this.redisSubscriber.disconnect();
    }
  }
}
