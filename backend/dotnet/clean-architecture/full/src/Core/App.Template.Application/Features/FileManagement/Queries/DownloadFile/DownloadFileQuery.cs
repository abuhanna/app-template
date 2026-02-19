using MediatR;

namespace AppTemplate.Application.Features.FileManagement.Queries.DownloadFile;

public record DownloadFileQuery(long Id) : IRequest<FileDownloadResult?>;

public record FileDownloadResult(
    Stream FileStream,
    string ContentType,
    string FileName);
