import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertRule } from './alert-rule.entity';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';

/**
 * Service responsible for managing alert rules.
 */
@Injectable()
export class AlertRuleService {
  constructor(
    @InjectRepository(AlertRule)
    private readonly alertRuleRepo: Repository<AlertRule>,
  ) {}

  /**
   * Creates a new alert rule from the provided DTO.
   * The DTO fields `metric`, `operator`, and `threshold` are mapped to the `condition` JSON column.
   */
  async create(dto: CreateAlertRuleDto): Promise<AlertRule> {
    const { metric, operator, threshold, ...rest } = dto;
    const rule = this.alertRuleRepo.create({
      ...rest,
      condition: {
        field: metric,
        operator,
        value: threshold,
      },
    } as Partial<AlertRule>);
    return this.alertRuleRepo.save(rule);
  }
}
