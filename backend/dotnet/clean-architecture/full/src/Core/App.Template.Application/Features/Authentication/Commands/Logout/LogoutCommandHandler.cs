using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.Authentication.Commands.Logout;

/// <summary>
/// Handler for LogoutCommand
/// </summary>
public class LogoutCommandHandler : IRequestHandler<LogoutCommand, bool>
{
    private readonly ILogger<LogoutCommandHandler> _logger;

    public LogoutCommandHandler(
        ILogger<LogoutCommandHandler> _logger)
    {
        this._logger = _logger;
    }

    public Task<bool> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing logout request");
        
        // For JWT with local auth, the client just discards the token.
        // Optionally, we could blacklist the token here if we implemented a blacklist service.
        // For now, we simply return success.
        
        _logger.LogInformation("Logout completed successfully");

        return Task.FromResult(true);
    }
}
