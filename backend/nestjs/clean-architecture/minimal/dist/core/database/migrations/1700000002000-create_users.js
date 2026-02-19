"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUsers1700000002000 = void 0;
const typeorm_1 = require("typeorm");
class CreateUsers1700000002000 {
    constructor() {
        this.name = 'CreateUsers1700000002000';
    }
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'users',
            columns: [
                {
                    name: 'id',
                    type: 'bigint',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'email',
                    type: 'varchar',
                    length: '255',
                    isUnique: true,
                },
                {
                    name: 'username',
                    type: 'varchar',
                    length: '100',
                    isUnique: true,
                },
                {
                    name: 'password_hash',
                    type: 'varchar',
                    length: '255',
                },
                {
                    name: 'first_name',
                    type: 'varchar',
                    length: '100',
                },
                {
                    name: 'last_name',
                    type: 'varchar',
                    length: '100',
                },
                {
                    name: 'role',
                    type: 'varchar',
                    length: '50',
                },
                {
                    name: 'department_id',
                    type: 'bigint',
                    isNullable: true,
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true,
                },
                {
                    name: 'last_login_at',
                    type: 'timestamptz',
                    isNullable: true,
                },
                {
                    name: 'password_reset_token',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'password_reset_token_expires_at',
                    type: 'timestamptz',
                    isNullable: true,
                },
                {
                    name: 'created_at',
                    type: 'timestamptz',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamptz',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'created_by',
                    type: 'bigint',
                    isNullable: true,
                },
                {
                    name: 'updated_by',
                    type: 'bigint',
                    isNullable: true,
                },
            ],
        }), true);
        await queryRunner.createForeignKey('users', new typeorm_1.TableForeignKey({
            columnNames: ['department_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'departments',
            onDelete: 'SET NULL',
        }));
        await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_username" ON "users" ("username")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_department_id" ON "users" ("department_id")`);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('users');
    }
}
exports.CreateUsers1700000002000 = CreateUsers1700000002000;
//# sourceMappingURL=1700000002000-create_users.js.map