import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import * as PDFDocument from 'pdfkit';

export interface ExportResult {
  buffer: Buffer;
  contentType: string;
  fileName: string;
}

export interface PdfReportOptions {
  subtitle?: string;
  fromDate?: Date;
  toDate?: Date;
  generatedBy?: string;
  includePageNumbers?: boolean;
  includeTimestamp?: boolean;
}

@Injectable()
export class ExportService {
  async exportToCsv<T extends Record<string, any>>(
    data: T[],
    fileName: string,
  ): Promise<ExportResult> {
    const fields = data.length > 0 ? Object.keys(data[0]) : [];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    const timestamp = this.getTimestamp();
    return {
      buffer: Buffer.from(csv, 'utf-8'),
      contentType: 'text/csv',
      fileName: `${fileName}_${timestamp}.csv`,
    };
  }

  async exportToExcel<T extends Record<string, any>>(
    data: T[],
    fileName: string,
    sheetName: string = 'Data',
  ): Promise<ExportResult> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AppTemplate';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(sheetName);

    if (data.length > 0) {
      // Add headers
      const columns = Object.keys(data[0]).map((key) => ({
        header: this.formatFieldName(key),
        key,
        width: 20,
      }));
      worksheet.columns = columns;

      // Style header row
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

      // Add data rows
      data.forEach((item) => {
        const row: Record<string, any> = {};
        Object.entries(item).forEach(([key, value]) => {
          row[key] = this.formatValue(value);
        });
        worksheet.addRow(row);
      });

      // Auto-filter
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: data.length + 1, column: columns.length },
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const timestamp = this.getTimestamp();

    return {
      buffer: Buffer.from(buffer),
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileName: `${fileName}_${timestamp}.xlsx`,
    };
  }

  async exportToPdf<T extends Record<string, any>>(
    data: T[],
    fileName: string,
    reportTitle: string,
    options: PdfReportOptions = {},
  ): Promise<ExportResult> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 30,
      });

      const chunks: Buffer[] = [];
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

      // Header
      this.addPdfHeader(doc, reportTitle, options);

      // Table
      if (data.length > 0) {
        this.addPdfTable(doc, data);
      }

      // Footer
      doc
        .fontSize(9)
        .fillColor('#666666')
        .text(`Total Records: ${data.length}`, 30, doc.page.height - 50, {
          align: 'left',
        });

      doc.end();
    });
  }

  private addPdfHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    options: PdfReportOptions,
  ): void {
    // Title
    doc.fontSize(18).fillColor('#333333').text(title, { align: 'left' });

    // Subtitle
    if (options.subtitle) {
      doc.fontSize(12).fillColor('#666666').text(options.subtitle);
    }

    // Metadata
    const metadata: string[] = [];
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

    // Separator
    doc.moveDown();
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(30, doc.y)
      .lineTo(doc.page.width - 30, doc.y)
      .stroke();
    doc.moveDown();
  }

  private addPdfTable<T extends Record<string, any>>(
    doc: PDFKit.PDFDocument,
    data: T[],
  ): void {
    const headers = Object.keys(data[0]);
    const tableWidth = doc.page.width - 60;
    const columnWidth = tableWidth / headers.length;
    const startX = 30;
    let startY = doc.y + 10;

    // Header row
    doc.fontSize(8).fillColor('#333333');
    headers.forEach((header, i) => {
      doc
        .rect(startX + i * columnWidth, startY, columnWidth, 20)
        .fillAndStroke('#e0e0e0', '#cccccc');
      doc
        .fillColor('#333333')
        .text(
          this.formatFieldName(header),
          startX + i * columnWidth + 4,
          startY + 6,
          {
            width: columnWidth - 8,
            ellipsis: true,
          },
        );
    });

    startY += 20;

    // Data rows
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
        .text(
          `... and ${data.length - maxRows} more records`,
          startX,
          startY + maxRows * rowHeight + 10,
        );
    }
  }

  private formatFieldName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) return '-';
    if (value instanceof Date) return value.toISOString().replace('T', ' ').split('.')[0];
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  }

  private getTimestamp(): string {
    return new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
  }
}
