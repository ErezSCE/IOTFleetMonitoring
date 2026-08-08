import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from './device.entity';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  deviceId!: string;

  @ManyToOne(() => Device, (device) => device.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deviceId' })
  device?: Device;

  @Column({ type: 'varchar', length: 255 })
  authorId!: string; // could be user id

  @Column({ type: 'text' })
  content!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
