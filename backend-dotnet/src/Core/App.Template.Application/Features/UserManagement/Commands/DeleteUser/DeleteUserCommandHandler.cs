using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.UserManagement.Commands.DeleteUser;

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DeleteUserCommandHandler> _logger;

    public DeleteUserCommandHandler(
        IApplicationDbContext context,
        ILogger<DeleteUserCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Deleting user: {Id}", request.Id);

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);

        if (user == null)
        {
            throw new InvalidOperationException($"User with ID {request.Id} not found");
        }

        // Soft delete - deactivate instead of removing
        user.SetActive(false);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User deactivated successfully: {Username} (ID: {Id})", user.Username, user.Id);

        return true;
    }
}
