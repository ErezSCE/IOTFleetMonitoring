import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'entity_type' })
  entityType!: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId?: string;

  @Column()
  action!: string;

  @Column({ name: 'performed_by', type: 'uuid', nullable: true })
  performedBy?: string;

  @CreateDateColumn({ name: 'performed_at', type: 'timestamptz' })
  performedAt!: Date;

  @Column({ name: 'before_json', type: 'jsonb', nullable: true })
  beforeJson?: Record<string, any>;

  @Column({ name: 'after_json', type: 'jsonb', nullable: true })
  afterJson?: Record<string, any>;
}
