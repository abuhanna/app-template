"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_orm_entity_1 = require("../../modules/user-management/infrastructure/persistence/user.orm-entity");
const department_orm_entity_1 = require("../../modules/department-management/infrastructure/persistence/department.orm-entity");
let SeedService = SeedService_1 = class SeedService {
    constructor(userRepository, departmentRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async onApplicationBootstrap() {
        await this.seedDepartments();
        await this.seedUsers();
    }
    async seedDepartments() {
        const count = await this.departmentRepository.count();
        if (count === 0) {
            this.logger.log('Seeding default departments...');
            const itDept = this.departmentRepository.create({
                code: 'IT',
                name: 'Information Technology',
                description: 'IT Department',
                isActive: true,
            });
            await this.departmentRepository.save(itDept);
        }
    }
    async seedUsers() {
        const count = await this.userRepository.count();
        if (count === 0) {
            this.logger.log('Seeding admin user...');
            const itDept = await this.departmentRepository.findOne({ where: { code: 'IT' } });
            if (!itDept)
                throw new Error('IT Department not found during seeding');
            const hashedPassword = await bcrypt.hash('Admin@123', 12);
            const admin = this.userRepository.create({
                username: 'admin',
                email: 'admin@apptemplate.local',
                passwordHash: hashedPassword,
                firstName: 'System',
                lastName: 'Administrator',
                role: 'Admin',
                department: itDept,
                isActive: true,
            });
            await this.userRepository.save(admin);
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_orm_entity_1.UserOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(department_orm_entity_1.DepartmentOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map