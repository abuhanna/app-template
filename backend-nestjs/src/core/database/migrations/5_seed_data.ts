import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedData1700000005 implements MigrationInterface {
  name = 'SeedData1700000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create IT department
    const departmentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    await queryRunner.query(`
      INSERT INTO "departments" ("id", "name", "code", "description", "is_active", "created_at", "updated_at")
      VALUES ('${departmentId}', 'Information Technology', 'IT', 'IT Department', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("code") DO NOTHING
    `);

    // Create admin user with password Admin@123
    const adminId = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    await queryRunner.query(`
      INSERT INTO "users" ("id", "email", "username", "password_hash", "first_name", "last_name", "role", "department_id", "is_active", "created_at", "updated_at")
      VALUES ('${adminId}', 'admin@apptemplate.local', 'admin', '${passwordHash}', 'Admin', 'User', 'Admin', '${departmentId}', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("email") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "users" WHERE "email" = 'admin@apptemplate.local'`);
    await queryRunner.query(`DELETE FROM "departments" WHERE "code" = 'IT'`);
  }
}
