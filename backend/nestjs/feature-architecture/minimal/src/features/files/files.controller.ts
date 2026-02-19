import { Controller, Post, Get, Param, UploadedFile as UploadedFileParam, UseInterceptors, Res, UseGuards, ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFileParam(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })], // 10MB
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.filesService.saveFile(file);
  }

  @Get(':id')
  async downloadFile(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const { file, contentType, fileName } = await this.filesService.getFile(+id);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    return file;
  }
}
