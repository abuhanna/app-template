import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadedFile } from '../../entities/uploaded-file.entity';
import { FilesService } from '../../services/files.service';
import { FilesController } from '../../controllers/files.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UploadedFile])],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
