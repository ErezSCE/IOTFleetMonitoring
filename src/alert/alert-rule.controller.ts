import { Controller, Post, Body } from '@nestjs/common';
import { AlertRuleService } from './alert-rule.service';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { AlertRule } from './alert-rule.entity';

/**
 * Controller exposing CRUD endpoints for alert rules.
 */
@Controller('alert-rules')
export class AlertRuleController {
  constructor(private readonly alertRuleService: AlertRuleService) {}

  @Post()
  async create(@Body() createDto: CreateAlertRuleDto): Promise<AlertRule> {
    return this.alertRuleService.create(createDto);
  }
}
