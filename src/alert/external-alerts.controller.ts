import { Controller, Get } from '@nestjs/common';
import { AlertService } from './alert.service';
import { Alert } from './alert.entity';

/**
 * Controller exposing external API endpoints for alerts.
 * Currently provides a read‑only endpoint for external systems to fetch active alerts.
 */
@Controller('external/alerts')
export class ExternalAlertsController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  async getActiveAlerts(): Promise<Alert[]> {
    return this.alertService.findActiveAlerts();
  }
}
