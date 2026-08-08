import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './alert.entity';

/**
 * Service responsible for persisting alerts.
 */
@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepo: Repository<Alert>,
  ) {}

  async createAlert(alertData: Partial<Alert>): Promise<Alert> {
    const alert = this.alertRepo.create(alertData);
    return this.alertRepo.save(alert);
  }
}
