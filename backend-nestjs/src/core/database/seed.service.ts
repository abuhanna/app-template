import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserOrmEntity } from '../../modules/user-management/infrastructure/persistence/user.orm-entity';
import { DepartmentOrmEntity } from '../../modules/department-management/infrastructure/persistence/department.orm-entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(DepartmentOrmEntity)
    private readonly departmentRepository: Repository<DepartmentOrmEntity>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedDepartments();
    await this.seedUsers();
  }

  private async seedDepartments() {
    const count = await this.departmentRepository.count();
    if (count === 0) {
      this.logger.log('Seeding default departments...');
      
      const itDept = this.departmentRepository.create({
        code: 'IT',
        name: 'Information Technology',
        description: 'IT Department',
        isActive: true,
      });

      await this.departmentRepository.save(itDept);
    }
  }

  private async seedUsers() {
    const count = await this.userRepository.count();
    if (count === 0) {
      this.logger.log('Seeding admin user...');

      const itDept = await this.departmentRepository.findOne({ where: { code: 'IT' } });
      if (!itDept) throw new Error('IT Department not found during seeding');

      const hashedPassword = await bcrypt.hash('Admin@123', 12);

      const admin = this.userRepository.create({
        username: 'admin',
        email: 'admin@apptemplate.local',
        passwordHash: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'Admin',
        department: itDept,
        isActive: true,
      });

      await this.userRepository.save(admin);
    }
  }
}
