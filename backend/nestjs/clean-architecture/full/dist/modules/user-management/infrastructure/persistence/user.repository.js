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
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_orm_entity_1 = require("./user.orm-entity");
const user_entity_1 = require("../../domain/entities/user.entity");
let UserRepository = class UserRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findById(id) {
        const entity = await this.repository.findOne({ where: { id: id.toString() } });
        return entity ? this.toDomain(entity) : null;
    }
    async findByEmail(email) {
        const entity = await this.repository.findOne({ where: { email } });
        return entity ? this.toDomain(entity) : null;
    }
    async findByUsername(username) {
        const entity = await this.repository.findOne({ where: { username } });
        return entity ? this.toDomain(entity) : null;
    }
    async findByPasswordResetToken(token) {
        const entity = await this.repository.findOne({
            where: { passwordResetToken: token },
        });
        return entity ? this.toDomain(entity) : null;
    }
    async findAll() {
        const entities = await this.repository.find({ order: { createdAt: 'DESC' } });
        return entities.map((entity) => this.toDomain(entity));
    }
    async findAllPaginated(options) {
        const { page, pageSize, sortBy, sortDir = 'asc', search } = options;
        const queryBuilder = this.repository.createQueryBuilder('user');
        if (search) {
            queryBuilder.where('(user.email ILIKE :search OR user.username ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search)', { search: `%${search}%` });
        }
        const validSortFields = ['id', 'email', 'username', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt'];
        const sortFieldMap = {
            id: 'user.id',
            email: 'user.email',
            username: 'user.username',
            firstName: 'user.first_name',
            lastName: 'user.last_name',
            role: 'user.role',
            isActive: 'user.is_active',
            createdAt: 'user.created_at',
            updatedAt: 'user.updated_at',
        };
        if (sortBy && validSortFields.includes(sortBy)) {
            queryBuilder.orderBy(sortFieldMap[sortBy], sortDir.toUpperCase());
        }
        else {
            queryBuilder.orderBy('user.created_at', 'DESC');
        }
        const totalItems = await queryBuilder.getCount();
        queryBuilder.skip((page - 1) * pageSize).take(pageSize);
        const entities = await queryBuilder.getMany();
        return {
            items: entities.map((entity) => this.toDomain(entity)),
            totalItems,
        };
    }
    async countByDepartmentId(departmentId) {
        return this.repository.count({ where: { departmentId: departmentId.toString() } });
    }
    async save(user) {
        const entity = this.toEntity(user);
        const savedEntity = await this.repository.save(entity);
        return this.toDomain(savedEntity);
    }
    async delete(id) {
        await this.repository.delete(id.toString());
    }
    toDomain(entity) {
        return user_entity_1.User.reconstitute(parseInt(entity.id, 10), entity.email, entity.username, entity.passwordHash, entity.firstName, entity.lastName, entity.role, entity.departmentId ? parseInt(entity.departmentId, 10) : null, entity.isActive, entity.lastLoginAt, entity.passwordResetToken, entity.passwordResetTokenExpiresAt, entity.passwordHistory || [], entity.createdAt, entity.updatedAt, entity.createdBy ? parseInt(entity.createdBy, 10) : null, entity.updatedBy ? parseInt(entity.updatedBy, 10) : null);
    }
    toEntity(user) {
        const entity = new user_orm_entity_1.UserOrmEntity();
        if (user.id !== 0) {
            entity.id = user.id.toString();
        }
        entity.email = user.email;
        entity.username = user.username;
        entity.passwordHash = user.passwordHash;
        entity.firstName = user.firstName;
        entity.lastName = user.lastName;
        entity.role = user.role;
        entity.departmentId = user.departmentId ? user.departmentId.toString() : null;
        entity.isActive = user.isActive;
        entity.lastLoginAt = user.lastLoginAt;
        entity.passwordResetToken = user.passwordResetToken;
        entity.passwordResetTokenExpiresAt = user.passwordResetTokenExpiresAt;
        entity.passwordHistory = user.passwordHistory;
        entity.createdAt = user.createdAt;
        entity.updatedAt = user.updatedAt;
        entity.createdBy = user.createdBy ? user.createdBy.toString() : null;
        entity.updatedBy = user.updatedBy ? user.updatedBy.toString() : null;
        return entity;
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_orm_entity_1.UserOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserRepository);
//# sourceMappingURL=user.repository.js.map