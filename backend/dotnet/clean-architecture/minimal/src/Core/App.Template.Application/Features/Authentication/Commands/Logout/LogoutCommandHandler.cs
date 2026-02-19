using AppTemplate.Application.Interfaces;

using MediatR;

using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.Authentication.Commands.Logout;

/// <summary>
/// Handler for LogoutCommand
/// </summary>
public class LogoutCommandHandler : IRequestHandler<LogoutCommand, bool>
{
    private readonly ISsoAuthService _ssoAuthService;
    private readonly ILogger<LogoutCommandHandler> _logger;

    public LogoutCommandHandler(
        ISsoAuthService ssoAuthService,
        ILogger<LogoutCommandHandler> logger)
    {
        _ssoAuthService = ssoAuthService;
        _logger = logger;
    }

    public async Task<bool> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing logout request");

        var result = await _ssoAuthService.LogoutAsync(
            request.AuthorizationHeader,
            cancellationToken);

        _logger.LogInformation("Logout completed: {Success}", result);

        return result;
    }
}
