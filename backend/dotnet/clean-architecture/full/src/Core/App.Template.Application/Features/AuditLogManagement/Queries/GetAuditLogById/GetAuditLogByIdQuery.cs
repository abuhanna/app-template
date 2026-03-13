using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.AuditLogManagement.Queries.GetAuditLogById;

public record GetAuditLogByIdQuery : IRequest<AuditLogDto?>
{
    public long Id { get; init; }
}

public class GetAuditLogByIdQueryHandler : IRequestHandler<GetAuditLogByIdQuery, AuditLogDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetAuditLogByIdQueryHandler> _logger;

    public GetAuditLogByIdQueryHandler(
        IApplicationDbContext context,
        ILogger<GetAuditLogByIdQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<AuditLogDto?> Handle(GetAuditLogByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching audit log by ID: {Id}", request.Id);

        var auditLog = await _context.AuditLogs
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (auditLog == null)
        {
            return null;
        }

        return new AuditLogDto
        {
            Id = auditLog.Id,
            EntityType = auditLog.EntityName,
            EntityId = auditLog.EntityId,
            Action = auditLog.Action.ToString(),
            UserId = auditLog.UserId,
            UserName = auditLog.UserName ?? auditLog.UserId,
            Details = auditLog.Details ?? auditLog.NewValues,
            IpAddress = auditLog.IpAddress,
            CreatedAt = auditLog.CreatedAt
        };
    }
}
