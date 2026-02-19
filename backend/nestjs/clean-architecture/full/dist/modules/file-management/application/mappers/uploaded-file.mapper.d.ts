import { UploadedFile } from '../../domain/entities/uploaded-file.entity';
import { UploadedFileDto } from '../dto/uploaded-file.dto';
export declare class UploadedFileMapper {
    static toDto(file: UploadedFile): UploadedFileDto;
}
