import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from '../device/device.entity';
import { AlertRule } from './alert-rule.entity';

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
}

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  deviceId!: string;

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'deviceId' })
  device?: Device;

  @Column({ type: 'uuid' })
  ruleId!: string;

  @ManyToOne(() => AlertRule)
  @JoinColumn({ name: 'ruleId' })
  rule?: AlertRule;

  @Column({ type: 'timestamptz' })
  triggeredAt!: Date;

  @Column({ type: 'enum', enum: AlertStatus, default: AlertStatus.ACTIVE })
  status!: AlertStatus;

  @Column({ type: 'jsonb', nullable: true })
  payload!: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
