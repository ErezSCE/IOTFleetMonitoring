import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RedisPublisherService } from './redis-publisher.service';
import { ExternalAlertsController } from './external-alerts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './alert.entity';
import { AlertRule } from './alert-rule.entity';
import { AlertService } from './alert.service';
import { EmailService } from './email.service';
import { RuleEvaluationService } from './rule-evaluation.service';
import { TelemetryConsumer } from './telemetry.consumer';

/**
 * AlertModule sets up the alert domain: persistence, rule evaluation, and email notification.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Alert, AlertRule])],
  controllers: [ExternalAlertsController],
  providers: [AlertService, EmailService, RuleEvaluationService, TelemetryConsumer, RedisPublisherService],
  exports: [AlertService],
})
export class AlertModule {}
