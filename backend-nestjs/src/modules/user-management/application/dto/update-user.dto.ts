import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, IsNumber, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../domain/value-objects/user-role';

export class UpdateUserDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'johndoe', description: 'Username', required: false })
  @IsString()
  @IsOptional()
  @MinLength(3)
  username?: string;

  @ApiProperty({ example: 'John', description: 'First name', required: false })
  @IsString()
  @IsOptional()
  @MinLength(1)
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', required: false })
  @IsString()
  @IsOptional()
  @MinLength(1)
  lastName?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.User, description: 'User role', required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ description: 'Department ID', required: false })
  @IsNumber()
  @IsOptional()
  departmentId?: number | null;

  @ApiProperty({ description: 'Is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
