"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersQuery = void 0;
class GetUsersQuery {
    constructor(page = 1, pageSize = 10, sortBy, sortDir, search) {
        this.page = page;
        this.pageSize = pageSize;
        this.sortBy = sortBy;
        this.sortDir = sortDir;
        this.search = search;
    }
}
exports.GetUsersQuery = GetUsersQuery;
//# sourceMappingURL=get-users.query.js.map