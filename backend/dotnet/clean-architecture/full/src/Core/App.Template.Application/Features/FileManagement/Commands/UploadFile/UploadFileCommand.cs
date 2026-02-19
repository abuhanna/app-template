using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.FileManagement.Commands.UploadFile;

public record UploadFileCommand : IRequest<UploadedFileDto>
{
    public required Stream FileStream { get; init; }
    public required string FileName { get; init; }
    public required string ContentType { get; init; }
    public required long FileSize { get; init; }
    public string? Description { get; init; }
    public string? Category { get; init; }
    public bool IsPublic { get; init; }
}
