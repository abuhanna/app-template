"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDepartments1700000001000 = void 0;
const typeorm_1 = require("typeorm");
class CreateDepartments1700000001000 {
    constructor() {
        this.name = 'CreateDepartments1700000001000';
    }
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'departments',
            columns: [
                {
                    name: 'id',
                    type: 'bigint',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'name',
                    type: 'varchar',
                    length: '100',
                },
                {
                    name: 'code',
                    type: 'varchar',
                    length: '20',
                    isUnique: true,
                },
                {
                    name: 'description',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true,
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
        await queryRunner.query(`CREATE INDEX "IDX_departments_code" ON "departments" ("code")`);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('departments');
    }
}
exports.CreateDepartments1700000001000 = CreateDepartments1700000001000;
//# sourceMappingURL=1700000001000-create_departments.js.map