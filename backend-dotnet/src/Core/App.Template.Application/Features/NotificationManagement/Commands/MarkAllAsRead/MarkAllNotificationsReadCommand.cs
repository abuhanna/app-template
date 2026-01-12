using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AppTemplate.Application.Features.NotificationManagement.Commands.MarkAllAsRead;

public record MarkAllNotificationsReadCommand : IRequest<bool>;

public class MarkAllNotificationsReadCommandHandler : IRequestHandler<MarkAllNotificationsReadCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public MarkAllNotificationsReadCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(MarkAllNotificationsReadCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId)) return false;

        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(cancellationToken);

        if (notifications.Count == 0) return true;

        foreach (var notification in notifications)
        {
            notification.MarkAsRead();
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
