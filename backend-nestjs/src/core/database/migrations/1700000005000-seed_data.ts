import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedData1700000005000 implements MigrationInterface {
  name = 'SeedData1700000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Moved to runtime seeding (SeedService)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Moved to runtime seeding (SeedService)
  }
}
