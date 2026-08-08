import { Injectable, Logger } from '@nestjs/common';
import { Alert } from './alert.entity';

/**
 * Stub email service. In production this would integrate with SendGrid or similar.
 * For now it simply logs the email sending action.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  sendAlertEmail(alert: Alert): void {
    // In a real implementation we would look up the user/email based on alert.rule.createdBy etc.
    // Here we just log the action to satisfy the acceptance criteria.
    this.logger.log(`Sending email notification for alert ${alert.id}`);
  }
}
