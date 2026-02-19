"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDepartmentsQuery = void 0;
class GetDepartmentsQuery {
    constructor(page = 1, pageSize = 10, sortBy, sortDir, search) {
        this.page = page;
        this.pageSize = pageSize;
        this.sortBy = sortBy;
        this.sortDir = sortDir;
        this.search = search;
    }
}
exports.GetDepartmentsQuery = GetDepartmentsQuery;
//# sourceMappingURL=get-departments.query.js.map