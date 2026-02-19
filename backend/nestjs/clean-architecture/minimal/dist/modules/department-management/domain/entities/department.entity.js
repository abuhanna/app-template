"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Department = void 0;
class Department {
    constructor(id, name, code, description, isActive, createdAt, updatedAt, createdBy, updatedBy) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }
    static create(props) {
        const now = new Date();
        return new Department(0, props.name, props.code.toUpperCase(), props.description ?? null, true, now, now, null, null);
    }
    static reconstitute(id, name, code, description, isActive, createdAt, updatedAt, createdBy, updatedBy) {
        return new Department(id, name, code, description, isActive, createdAt, updatedAt, createdBy, updatedBy);
    }
    update(props) {
        if (props.name !== undefined)
            this.name = props.name;
        if (props.code !== undefined)
            this.code = props.code.toUpperCase();
        if (props.description !== undefined)
            this.description = props.description;
        if (props.isActive !== undefined)
            this.isActive = props.isActive;
        this.updatedAt = new Date();
    }
    deactivate() {
        this.isActive = false;
        this.updatedAt = new Date();
    }
    activate() {
        this.isActive = true;
        this.updatedAt = new Date();
    }
}
exports.Department = Department;
//# sourceMappingURL=department.entity.js.map