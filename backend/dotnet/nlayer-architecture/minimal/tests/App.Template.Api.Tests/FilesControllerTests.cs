using App.Template.Api.Controllers;
using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace App.Template.Api.Tests;

public class FilesControllerTests
{
    private readonly Mock<IFileService> _mockFileService;
    private readonly FilesController _controller;

    public FilesControllerTests()
    {
        _mockFileService = new Mock<IFileService>();
        _controller = new FilesController(_mockFileService.Object);
    }

    [Fact]
    public async Task GetFiles_ReturnsOk()
    {
        _mockFileService
            .Setup(s => s.GetFilesAsync(null, null, 1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PagedResult<UploadedFileDto>
            {
                Items = new List<UploadedFileDto> { new() { Id = 1, OriginalFileName = "test.pdf" } }
            });

        var result = await _controller.GetFiles();

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetFile_ReturnsOk_WhenExists()
    {
        var file = new UploadedFileDto { Id = 1, OriginalFileName = "test.pdf" };
        _mockFileService.Setup(s => s.GetFileAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(file);

        var result = await _controller.GetFile(1, CancellationToken.None);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetFile_ReturnsNotFound_WhenDoesNotExist()
    {
        _mockFileService.Setup(s => s.GetFileAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync((UploadedFileDto?)null);

        var result = await _controller.GetFile(1, CancellationToken.None);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task Upload_ReturnsBadRequest_WhenFileIsNull()
    {
        var result = await _controller.Upload(null!);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Upload_ReturnsBadRequest_WhenFileIsEmpty()
    {
        var mockFile = new Mock<IFormFile>();
        mockFile.Setup(f => f.Length).Returns(0);

        var result = await _controller.Upload(mockFile.Object);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Download_ReturnsFile_WhenExists()
    {
        var stream = new MemoryStream(new byte[] { 1, 2, 3 });
        (Stream Stream, string ContentType, string FileName)? data = (stream, "application/pdf", "test.pdf");
        _mockFileService.Setup(s => s.GetFileStreamAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(data);

        var result = await _controller.Download(1, CancellationToken.None);

        Assert.IsType<FileStreamResult>(result);
    }

    [Fact]
    public async Task Download_ReturnsNotFound_WhenDoesNotExist()
    {
        _mockFileService.Setup(s => s.GetFileStreamAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(((Stream, string, string)?)null);

        var result = await _controller.Download(1, CancellationToken.None);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenSuccessful()
    {
        _mockFileService.Setup(s => s.DeleteFileAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var result = await _controller.Delete(1, CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenDoesNotExist()
    {
        _mockFileService.Setup(s => s.DeleteFileAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var result = await _controller.Delete(1, CancellationToken.None);

        Assert.IsType<NotFoundObjectResult>(result);
    }
}
