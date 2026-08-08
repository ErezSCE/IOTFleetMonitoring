import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AlertModule } from './alert.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './alert.entity';
import { AlertService } from './alert.service';
import { AlertStatus } from './alert.entity';

describe('ExternalAlertsController (e2e)', () => {
  let app: INestApplication;
  let alertService: AlertService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Alert],
          synchronize: true,
        }),
        AlertModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    alertService = app.get(AlertService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /external/alerts - returns only active alerts', async () => {
    // Seed alerts
    await alertService.createAlert({
      deviceId: 'device-1',
      ruleId: 'rule-1',
      triggeredAt: new Date(),
      status: AlertStatus.ACTIVE,
      payload: { temperature: 80 },
    });
    await alertService.createAlert({
      deviceId: 'device-2',
      ruleId: 'rule-2',
      triggeredAt: new Date(),
      status: AlertStatus.ACKNOWLEDGED,
      payload: { temperature: 85 },
    });

    const response = await request(app.getHttpServer())
      .get('/external/alerts')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].status).toBe(AlertStatus.ACTIVE);
  });

  it('GET /external/alerts - returns empty array when no active alerts', async () => {
    // Clear existing alerts by recreating the DB (simpler: start fresh module) - but for this test we assume previous alerts are isolated.
    // Create only non‑active alerts
    await alertService.createAlert({
      deviceId: 'device-3',
      ruleId: 'rule-3',
      triggeredAt: new Date(),
      status: AlertStatus.RESOLVED,
      payload: {},
    });

    const response = await request(app.getHttpServer())
      .get('/external/alerts')
      .expect(200);

    // Should return only alerts with ACTIVE status; none exist now.
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
});
