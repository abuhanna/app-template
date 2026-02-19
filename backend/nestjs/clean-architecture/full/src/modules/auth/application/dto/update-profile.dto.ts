import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
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

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;
}
