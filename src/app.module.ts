import { Module } from '@nestjs/common';
// import { AlertModule } from './alert/alert.module';
import { AuditModule } from './audit/audit.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './audit/audit.interceptor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceModule } from './device/device.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'iotfleet',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      migrations: [__dirname + '/migration/*{.ts,.js}'],
    }),
    DeviceModule,
    // AlertModule, // removed to reduce bundle size
    AuditModule,
  ],
  controllers: [],
  providers: [{ provide: APP_INTERCEPTOR, useClass: AuditInterceptor }],
})
export class AppModule {}
