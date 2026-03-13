using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AppTemplate.Application.Features.AuditLogManagement.Queries.GetAuditLogById;

public record GetAuditLogByIdQuery(long Id) : IRequest<AuditLogDto?>;

public class GetAuditLogByIdQueryHandler : IRequestHandler<GetAuditLogByIdQuery, AuditLogDto?>
{
    private readonly IApplicationDbContext _context;

    public GetAuditLogByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AuditLogDto?> Handle(GetAuditLogByIdQuery request, CancellationToken cancellationToken)
    {
        var auditLog = await _context.AuditLogs
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (auditLog == null)
            return null;

        return new AuditLogDto
        {
            Id = auditLog.Id,
            EntityType = auditLog.EntityName,
            EntityId = auditLog.EntityId,
            Action = auditLog.Action.ToString(),
            UserId = auditLog.UserId,
            UserName = auditLog.UserName,
            Details = auditLog.Details,
            IpAddress = auditLog.IpAddress,
            CreatedAt = auditLog.CreatedAt
        };
    }
}
