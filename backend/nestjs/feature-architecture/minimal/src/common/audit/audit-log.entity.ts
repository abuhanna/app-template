import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column({ name: 'entity_type' })
  entityType: string;

  @Column({ name: 'entity_id', type: 'varchar', nullable: true })
  entityId: string | null;

  @Column({ name: 'user_id', type: 'varchar', nullable: true })
  userId: string | null;

  @Column({ name: 'user_name', type: 'varchar', nullable: true })
  userName: string | null;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
