"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNotifications1700000003000 = void 0;
const typeorm_1 = require("typeorm");
class CreateNotifications1700000003000 {
    constructor() {
        this.name = 'CreateNotifications1700000003000';
    }
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'notifications',
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
                    name: 'title',
                    type: 'varchar',
                    length: '255',
                },
                {
                    name: 'message',
                    type: 'text',
                },
                {
                    name: 'type',
                    type: 'varchar',
                    length: '50',
                },
                {
                    name: 'link',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'is_read',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'read_at',
                    type: 'timestamptz',
                    isNullable: true,
                },
                {
                    name: 'created_at',
                    type: 'timestamptz',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        await queryRunner.createForeignKey('notifications', new typeorm_1.TableForeignKey({
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
        await queryRunner.query(`CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_notifications_user_id_is_read" ON "notifications" ("user_id", "is_read")`);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('notifications');
    }
}
exports.CreateNotifications1700000003000 = CreateNotifications1700000003000;
//# sourceMappingURL=1700000003000-create_notifications.js.map