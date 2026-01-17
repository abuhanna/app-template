using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.FileManagement.Queries.GetFile;

public record GetFileQuery(long Id) : IRequest<UploadedFileDto?>;
