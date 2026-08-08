import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { Alert } from './alert.entity';

/**
 * Service responsible for publishing alert events to Redis Pub/Sub.
 * In production this would be consumed by other services (e.g., WebSocket notification service).
 */
@Injectable()
export class RedisPublisherService {
  private readonly logger = new Logger(RedisPublisherService.name);
  private readonly redisClient: Redis.Redis;

  constructor() {
    // Connection details could be configured via env vars; using defaults for now.
    this.redisClient = new Redis();
    this.redisClient.on('error', (err) => this.logger.error('Redis error', err));
  }

  async publishAlert(alert: Alert): Promise<void> {
    const channel = 'alert';
    const message = JSON.stringify({
      id: alert.id,
      deviceId: alert.deviceId,
      ruleId: alert.ruleId,
      triggeredAt: alert.triggeredAt,
      status: alert.status,
      payload: alert.payload,
    });
    await this.redisClient.publish(channel, message);
    this.logger.log(`Published alert ${alert.id} to Redis channel ${channel}`);
  }
}
