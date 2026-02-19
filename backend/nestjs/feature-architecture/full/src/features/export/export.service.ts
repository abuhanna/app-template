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
}
