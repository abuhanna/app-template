namespace App.Template.Api.Models.Dtos;

public record UserDto(int Id, string Name, string Email, bool IsActive, DateTime CreatedAt);

public record CreateUserRequest(string Name, string Email, string Password);

public record UpdateUserRequest(string Name, string Email, bool IsActive);
