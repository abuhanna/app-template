using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.AuditLogManagement.Queries.GetAuditLogs;

public record GetAuditLogsQuery : IRequest<List<AuditLogDto>>
{
    public string? EntityName { get; init; }
    public string? EntityId { get; init; }
    public string? UserId { get; init; }
    public string? Action { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
