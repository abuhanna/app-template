"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = exports.AuditAction = void 0;
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATED"] = "CREATED";
    AuditAction["UPDATED"] = "UPDATED";
    AuditAction["DELETED"] = "DELETED";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
class AuditLog {
    constructor(partial) {
        Object.assign(this, partial);
    }
    static create(entityName, entityId, action, oldValues, newValues, affectedColumns, userId) {
        return new AuditLog({
            entityName,
            entityId,
            action,
            oldValues,
            newValues,
            affectedColumns,
            userId,
            timestamp: new Date(),
        });
    }
}
exports.AuditLog = AuditLog;
//# sourceMappingURL=audit-log.entity.js.map