using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.Authentication.Commands.UpdateMyProfile;

/// <summary>
/// Command to update the current user's profile
/// </summary>
public record UpdateMyProfileCommand : IRequest<UserDto>
{
    /// <summary>
    /// New email address (optional)
    /// </summary>
    public string? Email { get; init; }

    /// <summary>
    /// New first name (optional)
    /// </summary>
    public string? FirstName { get; init; }

    /// <summary>
    /// New last name (optional)
    /// </summary>
    public string? LastName { get; init; }
}
