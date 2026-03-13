import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'entity_name', type: 'varchar', length: 100 })
  entityName: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 50, nullable: true })
  entityId: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ name: 'old_values', type: 'text', nullable: true })
  oldValues: string;

  @Column({ name: 'new_values', type: 'text', nullable: true })
  newValues: string;

  @Column({ name: 'affected_columns', type: 'text', nullable: true })
  affectedColumns: string;

  @Column({ name: 'user_id', type: 'varchar', length: 100, nullable: true })
  userId: string;

  @Column({ name: 'user_name', type: 'varchar', length: 200, nullable: true })
  userName: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
