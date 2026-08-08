import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { DeviceModule } from './device.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './device.entity';
import { DeviceService } from './device.service';

describe('DeviceController GET /devices pagination', () => {
  let app: INestApplication;
  let deviceService: DeviceService;

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
    deviceService = moduleFixture.get<DeviceService>(DeviceService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear existing data
    const repo = (deviceService as any).deviceRepository;
    await repo.clear();
    // Insert sample devices
    const devices = [];
    for (let i = 1; i <= 15; i++) {
      devices.push({
        serialNumber: `SN${i}`,
        name: `Device ${i}`,
        metadata: { index: i },
        isActive: i % 2 === 0,
      });
    }
    await repo.save(devices);
  });

  it('should return paginated results with total count', async () => {
    const response = await request(app.getHttpServer())
      .get('/devices')
      .query({ page: '2', limit: '5' })
      .expect(200);
    expect(response.body.total).toBe(15);
    expect(response.body.data).toHaveLength(5);
    // Verify that the first item of page 2 is the 6th device (sorted by createdAt ASC by default)
    expect(response.body.data[0].serialNumber).toBe('SN6');
  });

  it('should sort by name descending', async () => {
    const response = await request(app.getHttpServer())
      .get('/devices')
      .query({ sortBy: 'name', sortOrder: 'DESC', limit: '3' })
      .expect(200);
    expect(response.body.data).toHaveLength(3);
    expect(response.body.data[0].name).toBe('Device 9'); // highest name alphabetically among first 3 due to DESC
  });

  it('should filter by isActive true', async () => {
    const response = await request(app.getHttpServer())
      .get('/devices')
      .query({ isActive: 'true' })
      .expect(200);
    // There are 7 even numbers between 1-15 => 7 active devices
    expect(response.body.total).toBe(7);
    expect(response.body.data.every((d: any) => d.isActive === true)).toBe(true);
  });

  it('should filter by exact name', async () => {
    const response = await request(app.getHttpServer())
      .get('/devices')
      .query({ name: 'Device 10' })
      .expect(200);
    expect(response.body.total).toBe(1);
    expect(response.body.data[0].serialNumber).toBe('SN10');
  });
});
