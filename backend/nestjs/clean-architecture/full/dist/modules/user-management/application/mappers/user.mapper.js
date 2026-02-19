"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const user_dto_1 = require("../dto/user.dto");
class UserMapper {
    static toDto(user, departmentName) {
        return new user_dto_1.UserDto({
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            role: user.role,
            departmentId: user.departmentId,
            departmentName: departmentName ?? null,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }
    static toDtoList(users) {
        return users.map((user) => UserMapper.toDto(user));
    }
}
exports.UserMapper = UserMapper;
//# sourceMappingURL=user.mapper.js.map