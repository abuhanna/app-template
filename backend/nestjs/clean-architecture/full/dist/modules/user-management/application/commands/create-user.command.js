"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserCommand = void 0;
class CreateUserCommand {
    constructor(email, username, password, firstName, lastName, role, departmentId) {
        this.email = email;
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.departmentId = departmentId;
    }
}
exports.CreateUserCommand = CreateUserCommand;
//# sourceMappingURL=create-user.command.js.map