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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagedResult = exports.PaginationMeta = void 0;
exports.createPagedResult = createPagedResult;
const swagger_1 = require("@nestjs/swagger");
class PaginationMeta {
}
exports.PaginationMeta = PaginationMeta;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page number', example: 1 }),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of items per page', example: 10 }),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "pageSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of items', example: 100 }),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "totalItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of pages', example: 10 }),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether there is a next page', example: true }),
    __metadata("design:type", Boolean)
], PaginationMeta.prototype, "hasNext", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether there is a previous page', example: false }),
    __metadata("design:type", Boolean)
], PaginationMeta.prototype, "hasPrevious", void 0);
class PagedResult {
}
exports.PagedResult = PagedResult;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of items', isArray: true }),
    __metadata("design:type", Array)
], PagedResult.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pagination metadata', type: PaginationMeta }),
    __metadata("design:type", PaginationMeta)
], PagedResult.prototype, "pagination", void 0);
function createPagedResult(items, totalItems, page, pageSize) {
    const totalPages = Math.ceil(totalItems / pageSize);
    return {
        items,
        pagination: {
            page,
            pageSize,
            totalItems,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1,
        },
    };
}
//# sourceMappingURL=paginated.js.map