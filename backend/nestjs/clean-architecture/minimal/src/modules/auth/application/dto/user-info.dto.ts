import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'First name', required: false })
  firstName?: string;

  @ApiProperty({ description: 'Last name', required: false })
  lastName?: string;

  @ApiProperty({ description: 'Full name', required: false })
  fullName?: string;

  @ApiProperty({ description: 'User role' })
  role: string;

  @ApiProperty({ description: 'Department ID', nullable: true, required: false })
  departmentId?: string | null;

  @ApiProperty({ description: 'Department name', nullable: true, required: false })
  departmentName?: string | null;

  constructor(partial: Partial<UserInfoDto>) {
    Object.assign(this, partial);
  }
}
