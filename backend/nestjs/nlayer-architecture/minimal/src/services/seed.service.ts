import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  async onModuleInit() {
    this.logger.log('Minimal variant — no seed data required (external auth, no users table)');
  }
}
