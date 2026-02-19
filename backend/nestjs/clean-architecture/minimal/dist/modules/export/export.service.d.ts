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
export declare class ExportService {
    exportToCsv<T extends Record<string, any>>(data: T[], fileName: string): Promise<ExportResult>;
    exportToExcel<T extends Record<string, any>>(data: T[], fileName: string, sheetName?: string): Promise<ExportResult>;
    exportToPdf<T extends Record<string, any>>(data: T[], fileName: string, reportTitle: string, options?: PdfReportOptions): Promise<ExportResult>;
    private addPdfHeader;
    private addPdfTable;
    private formatFieldName;
    private formatValue;
    private getTimestamp;
}
