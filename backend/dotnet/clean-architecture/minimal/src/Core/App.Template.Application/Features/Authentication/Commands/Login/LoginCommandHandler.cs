using AppTemplate.Application.DTOs.Auth;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.Authentication.Commands.Login;

/// <summary>
/// Handler for LoginCommand - delegates authentication to SSO service
/// </summary>
public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponseDto>
{
    private readonly ISsoAuthService _ssoAuthService;
    private readonly ILogger<LoginCommandHandler> _logger;

    public LoginCommandHandler(
        ISsoAuthService ssoAuthService,
        ILogger<LoginCommandHandler> logger)
    {
        _ssoAuthService = ssoAuthService;
        _logger = logger;
    }

    public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var identifier = !string.IsNullOrEmpty(request.Username) ? request.Username : request.Email;

        if (string.IsNullOrEmpty(identifier))
        {
            throw new InvalidOperationException("Username or email is required");
        }

        _logger.LogInformation("Processing SSO login request for user: {Username}", identifier);

        return await _ssoAuthService.LoginAsync(identifier, request.Password, cancellationToken);
    }
}
