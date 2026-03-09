import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../features/users/user.entity';
import { Department } from '../../features/departments/department.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedDepartments();
    await this.seedUsers();
  }

  private async seedDepartments() {
    const count = await this.departmentRepository.count();
    if (count === 0) {
      this.logger.log('Seeding default departments...');

      const dept = this.departmentRepository.create({
        code: 'GEN',
        name: 'General',
        description: 'Default department',
        isActive: true,
      });

      await this.departmentRepository.save(dept);
    }
  }

  private async seedUsers() {
    const count = await this.userRepository.count();
    if (count === 0) {
      this.logger.log('Seeding default users...');

      const dept = await this.departmentRepository.findOneBy({ code: 'GEN' });

      const adminPassword = await bcrypt.hash('Admin@123', 12);
      const admin = this.userRepository.create({
        username: 'admin',
        email: 'admin@apptemplate.com',
        passwordHash: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        departmentId: dept?.id ?? undefined,
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
        departmentId: dept?.id ?? undefined,
        isActive: true,
      });

      await this.userRepository.save([admin, sampleUser]);
    }
  }
}
