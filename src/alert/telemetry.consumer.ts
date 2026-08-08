import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RuleEvaluationService } from './rule-evaluation.service';
import * as amqp from 'amqplib';
import { Message } from 'amqplib';

/**
 * TelemetryConsumer connects to RabbitMQ, consumes telemetry messages,
 * and delegates evaluation to the RuleEvaluationService.
 */
@Injectable()
export class TelemetryConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelemetryConsumer.name);
  private connection?: amqp.Connection;
  private channel?: amqp.Channel;

  private readonly rabbitUrl: string = process.env.RABBITMQ_URL || 'amqp://localhost';
  private readonly queueName: string = process.env.TELEMETRY_QUEUE || 'telemetry';

  constructor(private readonly ruleEvalService: RuleEvaluationService) {}

  async onModuleInit(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.rabbitUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });
      this.channel.consume(this.queueName, (msg: Message | null) => {
        if (!msg) {
          return;
        }
        const raw = msg.content.toString();
        let data: any;
        try {
          data = JSON.parse(raw);
        } catch (parseErr) {
          this.logger.error('Failed to parse telemetry message', parseErr);
          this.channel?.nack(msg, false, false);
          return;
        }
        const { deviceId, payload } = data;
        // Process telemetry asynchronously but handle ack/nack in promise chain
        this.ruleEvalService.evaluateTelemetry(deviceId, payload)
          .then(() => {
            this.channel?.ack(msg);
          })
          .catch((err) => {
            this.logger.error('Failed to process telemetry message', err);
            this.channel?.nack(msg, false, false);
          });
      }
        if (!msg) {
          return;
        }
        try {
          const raw = msg.content.toString();
          const data = JSON.parse(raw);
          const { deviceId, payload } = data;
          await this.ruleEvalService.evaluateTelemetry(deviceId, payload);
          this.channel?.ack(msg);
        } catch (err) {
          this.logger.error('Failed to process telemetry message', err);
          // Optionally reject or requeue
          this.channel?.nack(msg, false, false);
        }
      });
      this.logger.log(`TelemetryConsumer listening on queue ${this.queueName}`);
    } catch (error) {
      this.logger.error('Failed to initialize TelemetryConsumer', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (err) {
      this.logger.error('Error during TelemetryConsumer shutdown', err);
    }
  }
}
