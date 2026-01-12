using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.UserManagement.Commands.ChangePassword;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHashService _passwordHashService;
    private readonly ILogger<ChangePasswordCommandHandler> _logger;

    public ChangePasswordCommandHandler(
        IApplicationDbContext context,
        IPasswordHashService passwordHashService,
        ILogger<ChangePasswordCommandHandler> logger)
    {
        _context = context;
        _passwordHashService = passwordHashService;
        _logger = logger;
    }

    public async Task<bool> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Changing password for user: {Id}", request.UserId);

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            throw new InvalidOperationException($"User with ID {request.UserId} not found");
        }

        // Verify current password
        if (!_passwordHashService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            throw new InvalidOperationException("Current password is incorrect");
        }

        // Hash and set new password
        var newPasswordHash = _passwordHashService.HashPassword(request.NewPassword);
        user.UpdatePassword(newPasswordHash);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Password changed successfully for user: {Username} (ID: {Id})", user.Username, user.Id);

        return true;
    }
}
