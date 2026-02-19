"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const user_role_1 = require("../value-objects/user-role");
class User {
    constructor(id, email, username, passwordHash, firstName, lastName, role, departmentId, isActive, lastLoginAt, passwordResetToken, passwordResetTokenExpiresAt, passwordHistory, createdAt, updatedAt, createdBy, updatedBy) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.passwordHash = passwordHash;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.departmentId = departmentId;
        this.isActive = isActive;
        this.lastLoginAt = lastLoginAt;
        this.passwordResetToken = passwordResetToken;
        this.passwordResetTokenExpiresAt = passwordResetTokenExpiresAt;
        this.passwordHistory = passwordHistory;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }
    static create(props) {
        const now = new Date();
        return new User(0, props.email, props.username, props.passwordHash, props.firstName, props.lastName, props.role, props.departmentId ?? null, true, null, null, null, [], now, now, null, null);
    }
    static reconstitute(id, email, username, passwordHash, firstName, lastName, role, departmentId, isActive, lastLoginAt, passwordResetToken, passwordResetTokenExpiresAt, passwordHistory, createdAt, updatedAt, createdBy, updatedBy) {
        return new User(id, email, username, passwordHash, firstName, lastName, role, departmentId, isActive, lastLoginAt, passwordResetToken, passwordResetTokenExpiresAt, passwordHistory, createdAt, updatedAt, createdBy, updatedBy);
    }
    update(props) {
        if (props.email !== undefined)
            this.email = props.email;
        if (props.username !== undefined)
            this.username = props.username;
        if (props.firstName !== undefined)
            this.firstName = props.firstName;
        if (props.lastName !== undefined)
            this.lastName = props.lastName;
        if (props.role !== undefined)
            this.role = props.role;
        if (props.departmentId !== undefined)
            this.departmentId = props.departmentId;
        if (props.isActive !== undefined)
            this.isActive = props.isActive;
        this.updatedAt = new Date();
    }
    updatePassword(passwordHash) {
        if (this.passwordHash) {
            this.passwordHistory.push(this.passwordHash);
            if (this.passwordHistory.length > 5) {
                this.passwordHistory.shift();
            }
        }
        this.passwordHash = passwordHash;
        this.clearPasswordResetToken();
        this.updatedAt = new Date();
    }
    isPasswordInHistory(passwordHash) {
        return this.passwordHistory.includes(passwordHash);
    }
    recordLogin() {
        this.lastLoginAt = new Date();
    }
    setPasswordResetToken(token, expiresInHours = 24) {
        this.passwordResetToken = token;
        this.passwordResetTokenExpiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    }
    clearPasswordResetToken() {
        this.passwordResetToken = null;
        this.passwordResetTokenExpiresAt = null;
    }
    isPasswordResetTokenValid(token) {
        if (!this.passwordResetToken || !this.passwordResetTokenExpiresAt) {
            return false;
        }
        if (this.passwordResetToken !== token) {
            return false;
        }
        return this.passwordResetTokenExpiresAt > new Date();
    }
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    isAdmin() {
        return this.role === user_role_1.UserRole.Admin;
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map