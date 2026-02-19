using MediatR;

namespace AppTemplate.Application.Features.FileManagement.Commands.DeleteFile;

public record DeleteFileCommand(long Id) : IRequest<bool>;
