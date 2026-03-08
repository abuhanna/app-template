import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  UploadedFile as UploadedFileParam,
  UseInterceptors,
  Res,
  UseGuards,
  ParseFilePipe,
  MaxFileSizeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { Response } from 'express';
import { UploadedFile } from './uploaded-file.entity';

@ApiTags('Files')
@Controller('files')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFileParam(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UploadedFile> {
    return this.filesService.saveFile(file);
  }

  @Get()
  @ApiOperation({ summary: 'List all uploaded files' })
  @ApiResponse({ status: 200, description: 'List of files' })
  async listFiles(): Promise<UploadedFile[]> {
    return this.filesService.listFiles();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Download a file' })
  @ApiResponse({ status: 200, description: 'File downloaded' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { file, contentType, fileName } = await this.filesService.getFile(id);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    return file;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 204, description: 'File deleted' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.filesService.deleteFile(id);
  }
}
