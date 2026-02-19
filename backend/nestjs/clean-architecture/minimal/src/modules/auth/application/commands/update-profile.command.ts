export class UpdateProfileCommand {
  constructor(
    public readonly userId: number,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly email?: string,
  ) {}
}
