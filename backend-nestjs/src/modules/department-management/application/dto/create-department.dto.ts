import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Information Technology', description: 'Department name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'IT', description: 'Department code (unique)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'IT department description', description: 'Department description', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
