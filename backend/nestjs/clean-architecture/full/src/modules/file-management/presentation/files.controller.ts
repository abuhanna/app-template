import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  Logger,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UploadedFileDto } from '../application/dto';
import { UploadFileCommand, DeleteFileCommand } from '../application/commands';
import { GetFilesQuery, GetFileByIdQuery, DownloadFileQuery } from '../application/queries';
import { PaginatedResult } from '../application/queries/get-files.handler';
import { FileDownloadResult } from '../application/queries/download-file.handler';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({ status: 200, description: 'List of files' })
  async findAll(
    @Query('category') category?: string,
    @Query('isPublic') isPublic?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<PaginatedResult<UploadedFileDto>> {
    return this.queryBus.execute(
      new GetFilesQuery(
        category,
        isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
        page ? parseInt(page) : undefined,
        pageSize ? parseInt(pageSize) : undefined,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ status: 200, type: UploadedFileDto })
  @ApiResponse({ status: 404, description: 'File not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UploadedFileDto> {
    return this.queryBus.execute(new GetFileByIdQuery(id));
  }

  @Post()
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        description: { type: 'string' },
        category: { type: 'string' },
        isPublic: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 201, type: UploadedFileDto })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('description') description?: string,
    @Query('category') category?: string,
    @Query('isPublic') isPublic?: string,
  ): Promise<UploadedFileDto> {
    this.logger.log(`Uploading file: ${file.originalname}, Size: ${file.size}`);

    return this.commandBus.execute(
      new UploadFileCommand(
        file.buffer,
        file.originalname,
        file.mimetype,
        file.size,
        description,
        category,
        isPublic === 'true',
      ),
    );
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a file' })
  @ApiResponse({ status: 200, description: 'File stream' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    const result: FileDownloadResult = await this.queryBus.execute(new DownloadFileQuery(id));

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);

    result.stream.pipe(res);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 204, description: 'File deleted' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.commandBus.execute(new DeleteFileCommand(id));
  }
}
