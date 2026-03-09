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

      const generalDept = this.departmentRepository.create({
        code: 'GEN',
        name: 'General',
        description: 'Default department',
        isActive: true,
      });

      await this.departmentRepository.save(generalDept);
    }
  }

  private async seedUsers() {
    const count = await this.userRepository.count();
    if (count === 0) {
      this.logger.log('Seeding default users...');

      const generalDept = await this.departmentRepository.findOne({ where: { code: 'GEN' } });
      if (!generalDept) throw new Error('General Department not found during seeding');

      const adminPassword = await bcrypt.hash('Admin@123', 12);
      const admin = this.userRepository.create({
        username: 'admin',
        email: 'admin@apptemplate.com',
        passwordHash: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        department: generalDept,
        isActive: true,
      });

      const userPassword = await bcrypt.hash('User@123', 12);
      const sampleUser = this.userRepository.create({
        username: 'johndoe',
        email: 'user@apptemplate.com',
        passwordHash: userPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        department: generalDept,
        isActive: true,
      });

      await this.userRepository.save([admin, sampleUser]);
    }
  }
}
