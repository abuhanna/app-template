using AppTemplate.Application.DTOs;
using AppTemplate.Application.Features.FileManagement.Commands.DeleteFile;
using AppTemplate.Application.Features.FileManagement.Commands.UploadFile;
using AppTemplate.Application.Features.FileManagement.Queries.DownloadFile;
using AppTemplate.Application.Features.FileManagement.Queries.GetFile;
using AppTemplate.Application.Features.FileManagement.Queries.GetFiles;
using AppTemplate.WebAPI.Controllers;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

namespace AppTemplate.WebAPI.Tests.Controllers;

public class FilesControllerTests
{
    private readonly Mock<ISender> _mockMediator;
    private readonly FilesController _controller;

    public FilesControllerTests()
    {
        _mockMediator = new Mock<ISender>();
        var mockLogger = new Mock<ILogger<FilesController>>();
        _controller = new FilesController(_mockMediator.Object, mockLogger.Object);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    [Fact]
    public async Task GetFiles_ReturnsOk()
    {
        var files = new List<UploadedFileDto> { new() { Id = 1, FileName = "test.pdf" } };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetFilesQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(files);

        var result = await _controller.GetFiles(null, null);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetFile_ReturnsOk_WhenExists()
    {
        var fileDto = new UploadedFileDto { Id = 1, FileName = "test.pdf" };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetFileQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(fileDto);

        var result = await _controller.GetFile(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetFile_ReturnsNotFound_WhenDoesNotExist()
    {
        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetFileQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UploadedFileDto?)null);

        var result = await _controller.GetFile(999);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task UploadFile_ReturnsBadRequest_WhenFileIsNull()
    {
        var result = await _controller.UploadFile(null!, null, null);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task UploadFile_ReturnsBadRequest_WhenFileIsEmpty()
    {
        var formFile = new FormFile(new MemoryStream(), 0, 0, "file", "empty.pdf")
        {
            Headers = new HeaderDictionary(),
            ContentType = "application/pdf"
        };

        var result = await _controller.UploadFile(formFile, null, null);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task DownloadFile_ReturnsFile_WhenExists()
    {
        var fileContent = "file content"u8.ToArray();
        var downloadResult = new FileDownloadResult(
            new MemoryStream(fileContent),
            "application/pdf",
            "report.pdf");

        _mockMediator
            .Setup(m => m.Send(It.IsAny<DownloadFileQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(downloadResult);

        var result = await _controller.DownloadFile(1);

        Assert.IsType<FileStreamResult>(result);
    }

    [Fact]
    public async Task DownloadFile_ReturnsNotFound_WhenDoesNotExist()
    {
        _mockMediator
            .Setup(m => m.Send(It.IsAny<DownloadFileQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((FileDownloadResult?)null);

        var result = await _controller.DownloadFile(999);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task DeleteFile_ReturnsNoContent_WhenExists()
    {
        _mockMediator
            .Setup(m => m.Send(It.IsAny<DeleteFileCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _controller.DeleteFile(1);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task DeleteFile_ReturnsNotFound_WhenDoesNotExist()
    {
        _mockMediator
            .Setup(m => m.Send(It.IsAny<DeleteFileCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var result = await _controller.DeleteFile(999);

        Assert.IsType<NotFoundObjectResult>(result);
    }
}
