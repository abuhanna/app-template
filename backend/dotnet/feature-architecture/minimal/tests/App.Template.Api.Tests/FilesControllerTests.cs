using App.Template.Api.Common.Models;
using App.Template.Api.Features.Files;
using App.Template.Api.Features.Files.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
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
        var mockLogger = new Mock<ILogger<FilesController>>();
        _controller = new FilesController(_mockFileService.Object, mockLogger.Object);
    }

    [Fact]
    public async Task GetFiles_ReturnsPaginatedResponse()
    {
        _mockFileService
            .Setup(s => s.GetFilesAsync(null, null, 1, 20))
            .ReturnsAsync(new PagedResult<UploadedFileDto>
            {
                Items = new List<UploadedFileDto> { new() { Id = 1, OriginalFileName = "test.pdf" } },
                Pagination = new PaginationMeta { Page = 1, PageSize = 20, TotalItems = 1, TotalPages = 1 }
            });

        var result = await _controller.GetFiles(null, null);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PaginatedResponse<UploadedFileDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Single(response.Data);
    }

    [Fact]
    public async Task GetFile_ReturnsApiResponse_WhenExists()
    {
        var file = new UploadedFileDto { Id = 1, OriginalFileName = "test.pdf" };
        _mockFileService.Setup(s => s.GetFileAsync(1)).ReturnsAsync(file);

        var result = await _controller.GetFile(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<UploadedFileDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
    }

    [Fact]
    public async Task GetFile_ReturnsNotFound_WhenDoesNotExist()
    {
        _mockFileService.Setup(s => s.GetFileAsync(1)).ReturnsAsync((UploadedFileDto?)null);

        var result = await _controller.GetFile(1);

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var response = Assert.IsType<ApiResponse>(notFoundResult.Value);
        Assert.False(response.Success);
    }

    [Fact]
    public async Task UploadFile_ReturnsBadRequest_WhenFileIsNull()
    {
        var result = await _controller.UploadFile(null!, null, null);

        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ApiResponse>(badRequestResult.Value);
        Assert.False(response.Success);
    }

    [Fact]
    public async Task UploadFile_ReturnsBadRequest_WhenFileIsEmpty()
    {
        var mockFile = new Mock<IFormFile>();
        mockFile.Setup(f => f.Length).Returns(0);

        var result = await _controller.UploadFile(mockFile.Object, null, null);

        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ApiResponse>(badRequestResult.Value);
        Assert.False(response.Success);
    }

    [Fact]
    public async Task DownloadFile_ReturnsNotFound_WhenDoesNotExist()
    {
        _mockFileService.Setup(s => s.GetFileStreamAsync(1)).ReturnsAsync(((Stream, string, string)?)null);

        var result = await _controller.DownloadFile(1);

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var response = Assert.IsType<ApiResponse>(notFoundResult.Value);
        Assert.False(response.Success);
    }

    [Fact]
    public async Task DownloadFile_ReturnsFile_WhenExists()
    {
        var stream = new MemoryStream(new byte[] { 1, 2, 3 });
        (Stream Stream, string ContentType, string FileName)? data = (stream, "application/pdf", "test.pdf");
        _mockFileService.Setup(s => s.GetFileStreamAsync(1)).ReturnsAsync(data);

        var result = await _controller.DownloadFile(1);

        Assert.IsType<FileStreamResult>(result);
    }

    [Fact]
    public async Task DeleteFile_ReturnsNoContent_WhenSuccessful()
    {
        _mockFileService.Setup(s => s.DeleteFileAsync(1)).ReturnsAsync(true);

        var result = await _controller.DeleteFile(1);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task DeleteFile_ReturnsNotFound_WhenDoesNotExist()
    {
        _mockFileService.Setup(s => s.DeleteFileAsync(1)).ReturnsAsync(false);

        var result = await _controller.DeleteFile(1);

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var response = Assert.IsType<ApiResponse>(notFoundResult.Value);
        Assert.False(response.Success);
    }
}
