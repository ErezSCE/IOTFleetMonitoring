import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from '../device/device.entity';

export enum ConditionOperator {
  GT = '>',
  LT = '<',
  GTE = '>=',
  LTE = '<=',
  EQ = '=',
  NEQ = '!=',
}

export interface Condition {
  field: string;
  operator: ConditionOperator;
  value: any;
}

@Entity('alert_rules')
export class AlertRule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'jsonb' })
  condition!: Condition;

  @Column({ nullable: true })
  severity?: string;

  @Column({ type: 'uuid', nullable: true })
  deviceId?: string;

  @ManyToOne(() => Device, { nullable: true })
  @JoinColumn({ name: 'deviceId' })
  device?: Device;

  @Column({ nullable: true })
  createdBy?: string; // user id

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
