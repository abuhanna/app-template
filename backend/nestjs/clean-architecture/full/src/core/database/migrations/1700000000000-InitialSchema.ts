import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "departments" (
        "id" BIGSERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "code" VARCHAR(255) NOT NULL UNIQUE,
        "description" TEXT,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "created_by" BIGINT,
        "updated_by" BIGINT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" BIGSERIAL PRIMARY KEY,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "username" VARCHAR(255) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255) NOT NULL,
        "first_name" VARCHAR(255) NOT NULL,
        "last_name" VARCHAR(255) NOT NULL,
        "role" VARCHAR(255) NOT NULL,
        "department_id" BIGINT REFERENCES "departments"("id") ON DELETE SET NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "last_login_at" TIMESTAMPTZ,
        "password_reset_token" VARCHAR,
        "password_reset_token_expires_at" TIMESTAMPTZ,
        "password_history" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "created_by" BIGINT,
        "updated_by" BIGINT
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_username" ON "users" ("username")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_department_id" ON "users" ("department_id")`);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" BIGSERIAL PRIMARY KEY,
        "user_id" BIGINT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title" VARCHAR(255) NOT NULL,
        "message" TEXT NOT NULL,
        "type" VARCHAR(255) NOT NULL,
        "reference_id" VARCHAR,
        "reference_type" VARCHAR,
        "is_read" BOOLEAN NOT NULL DEFAULT false,
        "read_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_user_id_is_read" ON "notifications" ("user_id", "is_read")`);

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" BIGSERIAL PRIMARY KEY,
        "user_id" BIGINT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token" VARCHAR(255) NOT NULL UNIQUE,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "device_info" VARCHAR,
        "ip_address" VARCHAR,
        "is_revoked" BOOLEAN NOT NULL DEFAULT false,
        "revoked_at" TIMESTAMPTZ,
        "replaced_by_token" VARCHAR,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_token" ON "refresh_tokens" ("token")`);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_expires_at" ON "refresh_tokens" ("expires_at")`);

    await queryRunner.query(`
      CREATE TABLE "uploaded_files" (
        "id" BIGSERIAL PRIMARY KEY,
        "file_name" VARCHAR(255) NOT NULL UNIQUE,
        "original_file_name" VARCHAR(255) NOT NULL,
        "content_type" VARCHAR(255) NOT NULL,
        "file_size" BIGINT NOT NULL,
        "storage_path" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "category" VARCHAR,
        "is_public" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "created_by" BIGINT,
        "updated_by" BIGINT
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_uploaded_files_category" ON "uploaded_files" ("category")`);
    await queryRunner.query(`CREATE INDEX "IDX_uploaded_files_created_by" ON "uploaded_files" ("created_by")`);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" SERIAL PRIMARY KEY,
        "entity_type" VARCHAR(100) NOT NULL,
        "entity_id" VARCHAR(50),
        "action" VARCHAR(20) NOT NULL,
        "user_id" BIGINT,
        "user_name" VARCHAR(200),
        "details" TEXT,
        "ip_address" VARCHAR(50),
        "old_values" TEXT,
        "new_values" TEXT,
        "affected_columns" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entity_type" ON "audit_logs" ("entity_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entity_id" ON "audit_logs" ("entity_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_user_id" ON "audit_logs" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "uploaded_files"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "departments"`);
  }
}
