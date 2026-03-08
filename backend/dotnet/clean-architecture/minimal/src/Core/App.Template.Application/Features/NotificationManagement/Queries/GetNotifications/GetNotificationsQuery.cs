using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AppTemplate.Application.Features.NotificationManagement.Queries.GetNotifications;

public record GetNotificationsQuery : IRequest<PagedResult<NotificationDto>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? SortBy { get; init; }
    public string? SortOrder { get; init; } = "desc";
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, PagedResult<NotificationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetNotificationsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
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

        // Get total count
        var totalItems = await query.CountAsync(cancellationToken);

        // Apply sorting
        var isDescending = request.SortOrder?.Equals("desc", StringComparison.OrdinalIgnoreCase) ?? true;
        query = request.SortBy?.ToLower() switch
        {
            "title" => isDescending ? query.OrderByDescending(n => n.Title) : query.OrderBy(n => n.Title),
            "isread" => isDescending ? query.OrderByDescending(n => n.IsRead) : query.OrderBy(n => n.IsRead),
            _ => isDescending ? query.OrderByDescending(n => n.CreatedAt) : query.OrderBy(n => n.CreatedAt)
        };

        // Apply pagination
        var notifications = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
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

        return PagedResult<NotificationDto>.Create(notifications, request.Page, request.PageSize, totalItems);
    }
}
