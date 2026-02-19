"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRefreshTokens1700000004000 = void 0;
const typeorm_1 = require("typeorm");
class CreateRefreshTokens1700000004000 {
    constructor() {
        this.name = 'CreateRefreshTokens1700000004000';
    }
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'refresh_tokens',
            columns: [
                {
                    name: 'id',
                    type: 'bigint',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'user_id',
                    type: 'bigint',
                },
                {
                    name: 'token',
                    type: 'varchar',
                    isUnique: true,
                },
                {
                    name: 'expires_at',
                    type: 'timestamptz',
                },
                {
                    name: 'device_info',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'ip_address',
                    type: 'varchar',
                    length: '45',
                    isNullable: true,
                },
                {
                    name: 'is_revoked',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'revoked_at',
                    type: 'timestamptz',
                    isNullable: true,
                },
                {
                    name: 'replaced_by_token',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'created_at',
                    type: 'timestamptz',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        await queryRunner.createForeignKey('refresh_tokens', new typeorm_1.TableForeignKey({
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
        await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_token" ON "refresh_tokens" ("token")`);
        await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_expires_at" ON "refresh_tokens" ("expires_at")`);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('refresh_tokens');
    }
}
exports.CreateRefreshTokens1700000004000 = CreateRefreshTokens1700000004000;
//# sourceMappingURL=1700000004000-create_refresh_tokens.js.map