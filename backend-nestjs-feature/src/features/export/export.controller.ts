import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('csv')
  async exportCsv(@Body() data: any[], @Res() res: Response) {
    const buffer = await this.exportService.exportToCsv(data);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="export_${Date.now()}.csv"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Post('excel')
  async exportExcel(@Body() data: any[], @Res() res: Response) {
    const buffer = await this.exportService.exportToExcel(data);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="export_${Date.now()}.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
