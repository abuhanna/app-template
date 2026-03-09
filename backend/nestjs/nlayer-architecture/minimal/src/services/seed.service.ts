import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminExists = await this.userRepository.findOneBy({
      email: 'admin@apptemplate.com',
    });

    if (!adminExists) {
      this.logger.log('Seeding admin user...');

      const admin = this.userRepository.create({
        username: 'admin',
        email: 'admin@apptemplate.com',
        passwordHash: '',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
      });

      await this.userRepository.save(admin);
    }
  }
}
