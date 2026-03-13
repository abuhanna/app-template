export class MarkNotificationReadCommand {
  constructor(
    public readonly notificationId: number,
    public readonly userId: string,
  ) {}
}
