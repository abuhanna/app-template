import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  async onApplicationBootstrap() {
    this.logger.log('Minimal variant: no seed data required');
  }
}
