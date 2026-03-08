import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
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

      const hashedPassword = await bcrypt.hash('Admin@123', 12);

      const admin = this.userRepository.create({
        name: 'admin',
        email: 'admin@apptemplate.local',
        passwordHash: hashedPassword,
        isActive: true,
      });

      await this.userRepository.save(admin);
      this.logger.log('Admin user seeded successfully');
    }
  }
}
