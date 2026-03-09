import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Department } from '../departments/department.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 500, nullable: true })
  passwordHash: string | null;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string | null;

  @Column({ length: 20, default: 'user' })
  role: string;

  @Column({ name: 'department_id', nullable: true })
  departmentId: number | null;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  get fullName(): string | null {
    if (this.firstName && this.lastName) return `${this.firstName} ${this.lastName}`;
    return this.firstName || this.lastName || null;
  }

  get departmentName(): string | null {
    return this.department?.name || null;
  }
}
