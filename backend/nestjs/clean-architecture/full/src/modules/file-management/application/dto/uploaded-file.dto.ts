import { ApiProperty } from '@nestjs/swagger';

export class UploadedFileDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  originalFileName: string;

  @ApiProperty()
  contentType: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty({ required: false })
  description: string | null;

  @ApiProperty({ required: false })
  category: string | null;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  updatedAt: Date;

  @ApiProperty({ required: false })
  createdBy: number | null;

  @ApiProperty()
  downloadUrl: string;
}
