
import { NotificationType } from '../enums/notification-type.enum';

export interface CreateNotificationProps {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
}

export class Notification {
  private constructor(
    public readonly id: number,
    public readonly userId: number,
    public title: string,
    public message: string,
    public type: NotificationType,
    public link: string | null,
    public isRead: boolean,
    public readAt: Date | null,
    public createdAt: Date,
  ) {}

  static create(props: CreateNotificationProps): Notification {
    return new Notification(
      0,
      props.userId,
      props.title,
      props.message,
      props.type,
      props.link ?? null,
      false,
      null,
      new Date(),
    );
  }

  static reconstitute(
    id: number,
    userId: number,
    title: string,
    message: string,
    type: NotificationType,
    link: string | null,
    isRead: boolean,
    readAt: Date | null,
    createdAt: Date,
  ): Notification {
    return new Notification(id, userId, title, message, type, link, isRead, readAt, createdAt);
  }

  markAsRead(): void {
    if (!this.isRead) {
      this.isRead = true;
      this.readAt = new Date();
    }
  }
}
