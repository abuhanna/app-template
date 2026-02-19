namespace AppTemplate.Application.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? UserGroup { get; } // Misal: "GROUP_SALES"
    string? AuthToken { get; }
}