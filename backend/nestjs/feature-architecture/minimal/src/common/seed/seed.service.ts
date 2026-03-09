import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../features/users/user.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
  }

  private async seedUsers() {
    const count = await this.userRepository.count();
    if (count === 0) {
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
