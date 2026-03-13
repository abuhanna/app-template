import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'entity_name', length: 100 })
  entityName: string;

  @Column({ name: 'entity_id', length: 50 })
  entityId: string;

  @Column({ length: 50 })
  action: string;

  @Column({ name: 'old_values', type: 'text', nullable: true })
  oldValues: string;

  @Column({ name: 'new_values', type: 'text', nullable: true })
  newValues: string;

  @Column({ name: 'affected_columns', type: 'text', nullable: true })
  affectedColumns: string;

  @Column({ name: 'user_id', length: 100, nullable: true })
  userId: string;

  @Column({ name: 'user_name', length: 200, nullable: true })
  userName: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
