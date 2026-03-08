import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UploadedFile as UploadedFileParam,
  UseInterceptors,
  Res,
  UseGuards,
  ParseFilePipe,
  MaxFileSizeValidator,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesService } from '../services/files.service';
import { Response } from 'express';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { SkipTransform } from '../common/decorators/response-message.decorator';

class FileQueryDto extends PaginationQueryDto {
  category?: string;
  isPublic?: string;
}

@ApiTags('Files')
@Controller('files')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  @ApiOperation({ summary: 'List all uploaded files' })
  @ApiResponse({ status: 200, description: 'Paginated list of files' })
  @ResponseMessage('Files retrieved successfully')
  async listFiles(@Query() query: FileQueryDto) {
    const isPublic =
      query.isPublic === 'true' ? true : query.isPublic === 'false' ? false : undefined;

    return this.filesService.findAllPaginated(
      query.page ?? 1,
      query.pageSize ?? 10,
      query.sortBy,
      query.sortOrder,
      query.search,
      query.category,
      isPublic,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ResponseMessage('File uploaded successfully')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFileParam(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Request() req: any,
    @Body('description') description?: string,
    @Body('category') category?: string,
    @Body('isPublic') isPublic?: string,
  ) {
    const userId = req.user?.userId?.toString();
    return this.filesService.saveFile(
      file,
      userId,
      description,
      category,
      isPublic === 'true',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata' })
  @ApiResponse({ status: 200, description: 'File metadata' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ResponseMessage('File retrieved successfully')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.filesService.findOne(id);
  }

  @Get(':id/download')
  @SkipTransform()
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
