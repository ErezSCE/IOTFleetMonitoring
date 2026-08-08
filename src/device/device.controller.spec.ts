import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { DeviceModule } from './device.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './device.entity';

describe('DeviceController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Device],
          synchronize: true,
        }),
        DeviceModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /devices - success', async () => {
    const payload = {
      serialNumber: 'SN123456',
      name: 'Test Device',
      metadata: { location: 'lab' },
    };
    const response = await request(app.getHttpServer())
      .post('/devices')
      .send(payload)
      .expect(201);
    expect(response.body).toMatchObject({
      serialNumber: payload.serialNumber,
      name: payload.name,
      metadata: payload.metadata,
      isActive: true,
    });
    expect(response.body.id).toBeDefined();
  });

  it('POST /devices - validation error when missing serialNumber', async () => {
    const payload = {
      name: 'No Serial',
    };
    await request(app.getHttpServer())
      .post('/devices')
      .send(payload)
      .expect(400);
  });
});
