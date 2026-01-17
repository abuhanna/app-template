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
@Index(['timestamp'])
export class AuditLogOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'entity_name', length: 100 })
  entityName: string;

  @Column({ name: 'entity_id', length: 50 })
  entityId: string;

  @Column({ length: 20 })
  action: string;

  @Column({ name: 'old_values', type: 'text', nullable: true })
  oldValues: string | null;

  @Column({ name: 'new_values', type: 'text', nullable: true })
  newValues: string | null;

  @Column({ name: 'affected_columns', type: 'text', nullable: true })
  affectedColumns: string | null;

  @Column({ name: 'user_id', nullable: true })
  userId: number | null;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;
}
