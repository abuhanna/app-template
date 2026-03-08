import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 500, nullable: true })
  passwordHash: string | null;

  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName: string | null;

  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName: string | null;

  @Column({ length: 20, default: 'user' })
  role: string;

  @Column({ name: 'department_id', nullable: true })
  departmentId: number | null;

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
}
