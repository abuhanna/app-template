"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const ExcelJS = require("exceljs");
const json2csv_1 = require("json2csv");
const pdfkit_1 = require("pdfkit");
let ExportService = class ExportService {
    async exportToCsv(data, fileName) {
        const fields = data.length > 0 ? Object.keys(data[0]) : [];
        const parser = new json2csv_1.Parser({ fields });
        const csv = parser.parse(data);
        const timestamp = this.getTimestamp();
        return {
            buffer: Buffer.from(csv, 'utf-8'),
            contentType: 'text/csv',
            fileName: `${fileName}_${timestamp}.csv`,
        };
    }
    async exportToExcel(data, fileName, sheetName = 'Data') {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'AppTemplate';
        workbook.created = new Date();
        const worksheet = workbook.addWorksheet(sheetName);
        if (data.length > 0) {
            const columns = Object.keys(data[0]).map((key) => ({
                header: this.formatFieldName(key),
                key,
                width: 20,
            }));
            worksheet.columns = columns;
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' },
            };
            headerRow.border = {
                bottom: { style: 'thin' },
            };
            data.forEach((item) => {
                const row = {};
                Object.entries(item).forEach(([key, value]) => {
                    row[key] = this.formatValue(value);
                });
                worksheet.addRow(row);
            });
            worksheet.autoFilter = {
                from: { row: 1, column: 1 },
                to: { row: data.length + 1, column: columns.length },
            };
        }
        const buffer = await workbook.xlsx.writeBuffer();
        const timestamp = this.getTimestamp();
        return {
            buffer: Buffer.from(buffer),
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            fileName: `${fileName}_${timestamp}.xlsx`,
        };
    }
    async exportToPdf(data, fileName, reportTitle, options = {}) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({
                size: 'A4',
                layout: 'landscape',
                margin: 30,
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const timestamp = this.getTimestamp();
                resolve({
                    buffer,
                    contentType: 'application/pdf',
                    fileName: `${fileName}_${timestamp}.pdf`,
                });
            });
            doc.on('error', reject);
            this.addPdfHeader(doc, reportTitle, options);
            if (data.length > 0) {
                this.addPdfTable(doc, data);
            }
            doc
                .fontSize(9)
                .fillColor('#666666')
                .text(`Total Records: ${data.length}`, 30, doc.page.height - 50, {
                align: 'left',
            });
            doc.end();
        });
    }
    addPdfHeader(doc, title, options) {
        doc.fontSize(18).fillColor('#333333').text(title, { align: 'left' });
        if (options.subtitle) {
            doc.fontSize(12).fillColor('#666666').text(options.subtitle);
        }
        const metadata = [];
        if (options.includeTimestamp !== false) {
            metadata.push(`Generated: ${new Date().toISOString()}`);
        }
        if (options.generatedBy) {
            metadata.push(`By: ${options.generatedBy}`);
        }
        if (options.fromDate || options.toDate) {
            const from = options.fromDate
                ? options.fromDate.toISOString().split('T')[0]
                : 'Start';
            const to = options.toDate
                ? options.toDate.toISOString().split('T')[0]
                : 'Now';
            metadata.push(`Period: ${from} - ${to}`);
        }
        if (metadata.length > 0) {
            doc.fontSize(8).fillColor('#888888').text(metadata.join(' | '));
        }
        doc.moveDown();
        doc
            .strokeColor('#cccccc')
            .lineWidth(1)
            .moveTo(30, doc.y)
            .lineTo(doc.page.width - 30, doc.y)
            .stroke();
        doc.moveDown();
    }
    addPdfTable(doc, data) {
        const headers = Object.keys(data[0]);
        const tableWidth = doc.page.width - 60;
        const columnWidth = tableWidth / headers.length;
        const startX = 30;
        let startY = doc.y + 10;
        doc.fontSize(8).fillColor('#333333');
        headers.forEach((header, i) => {
            doc
                .rect(startX + i * columnWidth, startY, columnWidth, 20)
                .fillAndStroke('#e0e0e0', '#cccccc');
            doc
                .fillColor('#333333')
                .text(this.formatFieldName(header), startX + i * columnWidth + 4, startY + 6, {
                width: columnWidth - 8,
                ellipsis: true,
            });
        });
        startY += 20;
        doc.fontSize(7);
        const rowHeight = 18;
        const maxRows = Math.floor((doc.page.height - startY - 60) / rowHeight);
        data.slice(0, maxRows).forEach((item, rowIndex) => {
            const y = startY + rowIndex * rowHeight;
            const bgColor = rowIndex % 2 === 0 ? '#ffffff' : '#f9f9f9';
            headers.forEach((header, colIndex) => {
                const x = startX + colIndex * columnWidth;
                doc.rect(x, y, columnWidth, rowHeight).fillAndStroke(bgColor, '#eeeeee');
                doc
                    .fillColor('#333333')
                    .text(String(this.formatValue(item[header]) ?? '-'), x + 4, y + 5, {
                    width: columnWidth - 8,
                    ellipsis: true,
                });
            });
        });
        if (data.length > maxRows) {
            doc
                .fontSize(8)
                .fillColor('#666666')
                .text(`... and ${data.length - maxRows} more records`, startX, startY + maxRows * rowHeight + 10);
        }
    }
    formatFieldName(name) {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    }
    formatValue(value) {
        if (value === null || value === undefined)
            return '-';
        if (value instanceof Date)
            return value.toISOString().replace('T', ' ').split('.')[0];
        if (typeof value === 'boolean')
            return value ? 'Yes' : 'No';
        return String(value);
    }
    getTimestamp() {
        return new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)()
], ExportService);
//# sourceMappingURL=export.service.js.map