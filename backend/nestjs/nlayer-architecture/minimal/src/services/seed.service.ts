import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
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
      const passwordHash = await bcrypt.hash('Admin@123', 10);
      const admin = this.userRepository.create({
        name: 'admin',
        email: 'admin@apptemplate.com',
        passwordHash,
        isActive: true,
      });
      await this.userRepository.save(admin);
      console.log('Admin user seeded: admin@apptemplate.com / Admin@123');
    }
  }
}
