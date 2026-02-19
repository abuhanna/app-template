export class LogoutCommand {
  constructor(
    public readonly userId: number,
    public readonly refreshToken?: string,
  ) {}
}
