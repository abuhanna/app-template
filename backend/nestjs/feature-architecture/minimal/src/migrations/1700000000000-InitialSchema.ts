import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "username" VARCHAR(50) NOT NULL UNIQUE,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password_hash" VARCHAR(500),
        "first_name" VARCHAR(100),
        "last_name" VARCHAR(100),
        "role" VARCHAR(20) NOT NULL DEFAULT 'user',
        "department_id" INTEGER,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "last_login_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_username" ON "users" ("username")`);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title" VARCHAR(255) NOT NULL,
        "message" TEXT NOT NULL,
        "type" VARCHAR(255) NOT NULL DEFAULT 'info',
        "reference_id" VARCHAR,
        "reference_type" VARCHAR,
        "is_read" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_user_id_is_read" ON "notifications" ("user_id", "is_read")`);

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token" VARCHAR(255) NOT NULL UNIQUE,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "is_revoked" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_token" ON "refresh_tokens" ("token")`);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")`);

    await queryRunner.query(`
      CREATE TABLE "uploaded_files" (
        "id" SERIAL PRIMARY KEY,
        "file_name" VARCHAR(255) NOT NULL,
        "original_file_name" VARCHAR(255) NOT NULL,
        "content_type" VARCHAR(255) NOT NULL,
        "file_size" BIGINT NOT NULL,
        "description" VARCHAR(255),
        "category" VARCHAR(255),
        "is_public" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "created_by" VARCHAR(255)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" SERIAL PRIMARY KEY,
        "action" VARCHAR(255) NOT NULL,
        "entity_type" VARCHAR(255) NOT NULL,
        "entity_id" VARCHAR(255),
        "user_id" VARCHAR(255),
        "user_name" VARCHAR(255),
        "details" TEXT,
        "ip_address" VARCHAR(255),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "uploaded_files"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
