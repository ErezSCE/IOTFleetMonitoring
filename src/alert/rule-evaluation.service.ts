import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertRule, ConditionOperator } from './alert-rule.entity';
import { RedisPublisherService } from './redis-publisher.service';
import { AlertService } from './alert.service';
import { EmailService } from './email.service';
import { Alert, AlertStatus } from './alert.entity';

/**
 * Service that evaluates incoming telemetry against alert rules.
 * It is deliberately simple: it loads all rules on each evaluation and
 * checks a single condition per rule.
 */
@Injectable()
export class RuleEvaluationService {
  private readonly logger = new Logger(RuleEvaluationService.name);

  constructor(
    @InjectRepository(AlertRule)
    private readonly ruleRepo: Repository<AlertRule>,
    private readonly alertService: AlertService,
    private readonly emailService: EmailService,
    private readonly redisPublisher: RedisPublisherService,
  ) {}

  /**
   * Evaluate a telemetry payload against all alert rules.
   * @param deviceId - ID of the device that sent the telemetry.
   * @param payload - Arbitrary JSON payload of telemetry.
   */
  async evaluateTelemetry(deviceId: string, payload: Record<string, any>): Promise<void> {
    const rules = await this.ruleRepo.find();
    for (const rule of rules) {
      if (this.matchesCondition(payload, rule.condition)) {
        // Create alert
        const alert: Partial<Alert> = {
          deviceId,
          ruleId: rule.id,
          triggeredAt: new Date(),
          status: AlertStatus.ACTIVE,
          payload,
        };
        const savedAlert = await this.alertService.createAlert(alert);
        this.logger.log(`Alert created: ${savedAlert.id} for rule ${rule.id}`);
        // Send email (stub)
        this.emailService.sendAlertEmail(savedAlert);
        await this.redisPublisher.publishAlert(savedAlert);
      }
    }
  }

  private matchesCondition(payload: Record<string, any>, condition: any): boolean {
    const { field, operator, value } = condition as { field: string; operator: ConditionOperator; value: any };
    const payloadValue = payload[field];
    switch (operator) {
      case ConditionOperator.GT:
        return payloadValue > value;
      case ConditionOperator.LT:
        return payloadValue < value;
      case ConditionOperator.GTE:
        return payloadValue >= value;
      case ConditionOperator.LTE:
        return payloadValue <= value;
      case ConditionOperator.EQ:
        return payloadValue === value;
      case ConditionOperator.NEQ:
        return payloadValue !== value;
      default:
        return false;
    }
  }
}
