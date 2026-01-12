using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AppTemplate.Application.Features.NotificationManagement.Queries.GetNotifications;

public record GetNotificationsQuery : IRequest<List<NotificationDto>>
{
    public int? Limit { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, List<NotificationDto>>
{
    private readonly IBpmDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetNotificationsQueryHandler(IBpmDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<List<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("User not authenticated");

        var query = _context.Notifications
            .Where(n => n.UserId == userId);

        if (request.StartDate.HasValue)
        {
            query = query.Where(n => n.CreatedAt >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            // Include the entire end date (up to 23:59:59)
            var endDate = request.EndDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(n => n.CreatedAt <= endDate);
        }

        // Apply ordering
        query = query.OrderByDescending(n => n.CreatedAt);

        // Apply limit (default to 15 if not specified, unless filtering by date range where user might want all)
        // If filters are present but no limit, we don't limit.
        // If no filters and no limit, we limit to 15 (safe default).
        if (request.Limit.HasValue)
        {
            query = query.Take(request.Limit.Value);
        }
        else if (!request.StartDate.HasValue && !request.EndDate.HasValue)
        {
            // Default limit if no specific filters provided
            query = query.Take(15);
        }

        var notifications = await query
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                ReferenceId = n.ReferenceId,
                ReferenceType = n.ReferenceType,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return notifications;
    }
}
