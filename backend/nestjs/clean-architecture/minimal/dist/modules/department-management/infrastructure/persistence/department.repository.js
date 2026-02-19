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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const department_orm_entity_1 = require("./department.orm-entity");
const department_entity_1 = require("../../domain/entities/department.entity");
let DepartmentRepository = class DepartmentRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findById(id) {
        const entity = await this.repository.findOne({ where: { id: id.toString() } });
        return entity ? this.toDomain(entity) : null;
    }
    async findByCode(code) {
        const entity = await this.repository.findOne({ where: { code: code.toUpperCase() } });
        return entity ? this.toDomain(entity) : null;
    }
    async findAll() {
        const entities = await this.repository.find({ order: { name: 'ASC' } });
        return entities.map((entity) => this.toDomain(entity));
    }
    async findAllPaginated(options) {
        const { page, pageSize, sortBy, sortDir = 'asc', search } = options;
        const queryBuilder = this.repository.createQueryBuilder('department');
        if (search) {
            queryBuilder.where('(department.name ILIKE :search OR department.code ILIKE :search OR department.description ILIKE :search)', { search: `%${search}%` });
        }
        const validSortFields = ['id', 'name', 'code', 'isActive', 'createdAt', 'updatedAt'];
        const sortFieldMap = {
            id: 'department.id',
            name: 'department.name',
            code: 'department.code',
            isActive: 'department.is_active',
            createdAt: 'department.created_at',
            updatedAt: 'department.updated_at',
        };
        if (sortBy && validSortFields.includes(sortBy)) {
            queryBuilder.orderBy(sortFieldMap[sortBy], sortDir.toUpperCase());
        }
        else {
            queryBuilder.orderBy('department.name', 'ASC');
        }
        const totalItems = await queryBuilder.getCount();
        queryBuilder.skip((page - 1) * pageSize).take(pageSize);
        const entities = await queryBuilder.getMany();
        return {
            items: entities.map((entity) => this.toDomain(entity)),
            totalItems,
        };
    }
    async save(department) {
        const entity = this.toEntity(department);
        const savedEntity = await this.repository.save(entity);
        return this.toDomain(savedEntity);
    }
    async delete(id) {
        await this.repository.delete(id.toString());
    }
    toDomain(entity) {
        return department_entity_1.Department.reconstitute(parseInt(entity.id, 10), entity.name, entity.code, entity.description, entity.isActive, entity.createdAt, entity.updatedAt, entity.createdBy ? parseInt(entity.createdBy, 10) : null, entity.updatedBy ? parseInt(entity.updatedBy, 10) : null);
    }
    toEntity(department) {
        const entity = new department_orm_entity_1.DepartmentOrmEntity();
        if (department.id !== 0) {
            entity.id = department.id.toString();
        }
        entity.name = department.name;
        entity.code = department.code;
        entity.description = department.description;
        entity.isActive = department.isActive;
        entity.createdAt = department.createdAt;
        entity.updatedAt = department.updatedAt;
        entity.createdBy = department.createdBy ? department.createdBy.toString() : null;
        entity.updatedBy = department.updatedBy ? department.updatedBy.toString() : null;
        return entity;
    }
};
exports.DepartmentRepository = DepartmentRepository;
exports.DepartmentRepository = DepartmentRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(department_orm_entity_1.DepartmentOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DepartmentRepository);
//# sourceMappingURL=department.repository.js.map