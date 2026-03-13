import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
@Index(['entityName'])
@Index(['entityId'])
@Index(['userId'])
@Index(['createdAt'])
export class AuditLogOrmEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'entity_name', length: 100 })
  entityName: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 50, nullable: true })
  entityId: string | null;

  @Column({ length: 50 })
  action: string;

  @Column({ name: 'user_id', type: 'varchar', length: 100, nullable: true })
  userId: string | null;

  @Column({ name: 'user_name', type: 'varchar', length: 200, nullable: true })
  userName: string | null;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'old_values', type: 'text', nullable: true })
  oldValues: string | null;

  @Column({ name: 'new_values', type: 'text', nullable: true })
  newValues: string | null;

  @Column({ name: 'affected_columns', type: 'text', nullable: true })
  affectedColumns: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
