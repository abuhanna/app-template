import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDepartmentDto {
  @ApiProperty({ example: 'Information Technology', description: 'Department name', required: false })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'IT', description: 'Department code (unique)', required: false })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(20)
  code?: string;

  @ApiProperty({ example: 'IT department description', description: 'Department description', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string | null;

  @ApiProperty({ example: true, description: 'Is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
