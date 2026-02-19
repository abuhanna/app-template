"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserCommand = void 0;
class UpdateUserCommand {
    constructor(id, email, username, firstName, lastName, role, departmentId, isActive) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.departmentId = departmentId;
        this.isActive = isActive;
    }
}
exports.UpdateUserCommand = UpdateUserCommand;
//# sourceMappingURL=update-user.command.js.map