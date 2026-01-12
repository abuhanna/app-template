import { ApiProperty } from '@nestjs/swagger';

export class DepartmentDto {
  @ApiProperty({ description: 'Department ID' })
  id: string;

  @ApiProperty({ description: 'Department name' })
  name: string;

  @ApiProperty({ description: 'Department code' })
  code: string;

  @ApiProperty({ description: 'Department description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;

  constructor(partial: Partial<DepartmentDto>) {
    Object.assign(this, partial);
  }
}
