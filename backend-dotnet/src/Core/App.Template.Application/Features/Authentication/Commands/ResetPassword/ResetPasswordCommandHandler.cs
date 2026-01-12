using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.Authentication.Commands.ResetPassword;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, bool>
{
    private readonly IBpmDbContext _context;
    private readonly IPasswordHashService _passwordHashService;
    private readonly ILogger<ResetPasswordCommandHandler> _logger;

    public ResetPasswordCommandHandler(
        IBpmDbContext context,
        IPasswordHashService passwordHashService,
        ILogger<ResetPasswordCommandHandler> logger)
    {
        _context = context;
        _passwordHashService = passwordHashService;
        _logger = logger;
    }

    public async Task<bool> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        // Find user by reset token
        var user = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.PasswordResetToken == request.Token &&
                u.IsActive,
                cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("Password reset attempted with invalid or expired token");
            throw new InvalidOperationException("Invalid or expired reset token");
        }

        // Validate token hasn't expired
        if (!user.IsPasswordResetTokenValid(request.Token))
        {
            _logger.LogWarning("Password reset attempted with expired token for user {UserId}", user.Id);
            throw new InvalidOperationException("Reset token has expired");
        }

        // Hash the new password
        var passwordHash = _passwordHashService.HashPassword(request.NewPassword);

        // Update password and clear reset token
        user.UpdatePassword(passwordHash);
        user.ClearPasswordResetToken();

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Password successfully reset for user {UserId}", user.Id);

        return true;
    }
}
