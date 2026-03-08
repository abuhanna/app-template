import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../domain/enums/notification-type.enum';

export class NotificationDto {
  @ApiProperty({ description: 'Notification ID' })
  id: number;

  @ApiProperty({ description: 'Notification title' })
  title: string;

  @ApiProperty({ description: 'Notification message' })
  message: string;

  @ApiProperty({ enum: NotificationType, description: 'Notification type' })
  type: NotificationType;

  @ApiProperty({ description: 'Reference entity ID', nullable: true })
  referenceId: string | null;

  @ApiProperty({ description: 'Reference entity type', nullable: true })
  referenceType: string | null;

  @ApiProperty({ description: 'Is read' })
  isRead: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  constructor(partial: Partial<NotificationDto>) {
    Object.assign(this, partial);
  }
}
