export class DeleteNotificationCommand {
  constructor(
    public readonly notificationId: number,
    public readonly userId: string,
  ) {}
}
