import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class AuditLogDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  entityName: string;

  @ApiProperty()
  entityId: string;

  @ApiProperty()
  action: string;

  @ApiPropertyOptional()
  oldValues: string | null;

  @ApiPropertyOptional()
  newValues: string | null;

  @ApiPropertyOptional()
  affectedColumns: string | null;

  @ApiPropertyOptional()
  userId: number | null;

  @ApiProperty()
  timestamp: Date;
}

export class GetAuditLogsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number = 20;
}
