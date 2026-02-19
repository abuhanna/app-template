"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuditLogsQuery = void 0;
class GetAuditLogsQuery {
    constructor(entityName, entityId, userId, action, fromDate, toDate, page = 1, pageSize = 20, sortBy, sortDir, search) {
        this.entityName = entityName;
        this.entityId = entityId;
        this.userId = userId;
        this.action = action;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.page = page;
        this.pageSize = pageSize;
        this.sortBy = sortBy;
        this.sortDir = sortDir;
        this.search = search;
    }
}
exports.GetAuditLogsQuery = GetAuditLogsQuery;
//# sourceMappingURL=get-audit-logs.query.js.map