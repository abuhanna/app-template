import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiProperty({ description: 'User role' })
  role: string;

  @ApiProperty({ description: 'Department ID', nullable: true })
  departmentId: number | null;

  @ApiPropertyOptional({ description: 'Department name', nullable: true })
  departmentName?: string | null;

  @ApiProperty({ description: 'Whether the user is active' })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Last login timestamp', nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty({ description: 'Account creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  constructor(partial: Partial<UserInfoDto>) {
    Object.assign(this, partial);
  }
}
