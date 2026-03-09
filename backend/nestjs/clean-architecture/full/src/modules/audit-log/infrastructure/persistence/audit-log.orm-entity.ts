import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
@Index(['entityType'])
@Index(['entityId'])
@Index(['userId'])
@Index(['createdAt'])
export class AuditLogOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'entity_type', length: 100 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 50, nullable: true })
  entityId: string | null;

  @Column({ length: 20 })
  action: string;

  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId: number | null;

  @Column({ name: 'user_name', type: 'varchar', length: 200, nullable: true })
  userName: string | null;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
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
