import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string; // create, update, delete, login, logout

  @Column({ name: 'entity_type' })
  entityType: string; // User, Department, File, Notification

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'user_name', nullable: true })
  userName: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
