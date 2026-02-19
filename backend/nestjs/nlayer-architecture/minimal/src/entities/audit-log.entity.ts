import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: string;

  @Column()
  type: string; // INSERT, UPDATE, DELETE

  @Column()
  tableName: string;

  @CreateDateColumn()
  dateTime: Date;

  @Column({ type: 'text', nullable: true })
  oldValues: string;

  @Column({ type: 'text', nullable: true })
  newValues: string;
}
