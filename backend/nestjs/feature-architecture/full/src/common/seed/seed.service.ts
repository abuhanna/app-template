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
      this.logger.log('Seeding IT department...');

      const dept = this.departmentRepository.create({
        code: 'IT',
        name: 'IT Department',
        isActive: true,
      });

      await this.departmentRepository.save(dept);
      this.logger.log('IT department seeded successfully');
    }
  }

  private async seedUsers() {
    const count = await this.userRepository.count();
    if (count === 0) {
      this.logger.log('Seeding admin user...');

      const dept = await this.departmentRepository.findOneBy({ code: 'IT' });
      const hashedPassword = await bcrypt.hash('Admin@123', 12);

      const admin = this.userRepository.create({
        username: 'admin',
        email: 'admin@apptemplate.com',
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: undefined,
        role: 'admin',
        departmentId: dept?.id ?? undefined,
        isActive: true,
      });

      await this.userRepository.save(admin);
      this.logger.log('Admin user seeded successfully');
    }
  }
}
