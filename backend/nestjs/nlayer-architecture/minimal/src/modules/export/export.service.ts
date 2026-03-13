import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify/sync';

@Injectable()
export class ExportService {
  async exportToCsv(data: any[]): Promise<Buffer> {
    const csvString = stringify(data, { header: true });
    return Buffer.from(csvString);
  }

  async exportToExcel(data: any[], sheetName = 'Data'): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    if (data.length > 0) {
      const columns = Object.keys(data[0]).map((key) => ({ header: key, key }));
      worksheet.columns = columns;
      worksheet.addRows(data);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportToPdf(data: any[]): Promise<Buffer> {
    // Simple PDF generation with plain text
    // In production, use pdfkit for proper formatting
    const content = JSON.stringify(data, null, 2);
    return Buffer.from(content);
  }

  getContentType(format: string): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'pdf':
        return 'application/pdf';
      case 'xlsx':
      default:
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
  }

  getExtension(format: string): string {
    switch (format) {
      case 'csv':
        return 'csv';
      case 'pdf':
        return 'pdf';
      case 'xlsx':
      default:
        return 'xlsx';
    }
  }

  async exportData(data: any[], format: string): Promise<Buffer> {
    switch (format) {
      case 'csv':
        return this.exportToCsv(data);
      case 'pdf':
        return this.exportToPdf(data);
      case 'xlsx':
      default:
        return this.exportToExcel(data);
    }
  }
}
