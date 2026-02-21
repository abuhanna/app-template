namespace App.Template.Api.Features.Users.Dtos;

public record UserDto(long Id, string Username, string Name, string Email, string Role, bool IsActive, DateTime CreatedAt);
