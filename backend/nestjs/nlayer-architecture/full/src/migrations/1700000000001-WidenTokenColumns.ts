import { MigrationInterface, QueryRunner } from 'typeorm';

export class WidenTokenColumns1700000000001 implements MigrationInterface {
  name = 'WidenTokenColumns1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "token" TYPE TEXT`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "replaced_by_token" TYPE TEXT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "replaced_by_token" TYPE VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "token" TYPE VARCHAR(255)`);
  }
}
