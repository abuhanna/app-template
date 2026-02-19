using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.FileManagement.Queries.GetFiles;

public record GetFilesQuery : IRequest<List<UploadedFileDto>>
{
    public string? Category { get; init; }
    public bool? IsPublic { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
