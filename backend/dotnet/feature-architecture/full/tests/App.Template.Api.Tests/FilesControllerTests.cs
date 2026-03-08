using App.Template.Api.Common.Models;
using App.Template.Api.Features.Files;
using App.Template.Api.Features.Files.Dtos;
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
    public async Task GetAll_ReturnsOk_WithPaginatedFiles()
    {
        var queryParams = new FilesQueryParams();
        var files = new PagedResult<UploadedFileDto>
        {
            Items = new List<UploadedFileDto>
            {
                new() { Id = 1, FileName = "test.pdf" }
            }
        };
        _mockFileService.Setup(s => s.GetFilesAsync(queryParams)).ReturnsAsync(files);

        var result = await _controller.GetAll(queryParams);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<PaginatedResponse<UploadedFileDto>>(okResult.Value);
        Assert.True(value.Success);
    }

    [Fact]
    public async Task GetMetadata_ReturnsOk_WhenFileExists()
    {
        var file = new UploadedFileDto { Id = 1, FileName = "test.pdf" };
        _mockFileService.Setup(s => s.GetMetadataAsync(1)).ReturnsAsync(file);

        var result = await _controller.GetMetadata(1);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse<UploadedFileDto>>(okResult.Value);
        Assert.True(value.Success);
    }

    [Fact]
    public async Task GetMetadata_ReturnsNotFound_WhenFileDoesNotExist()
    {
        _mockFileService.Setup(s => s.GetMetadataAsync(1)).ReturnsAsync((UploadedFileDto?)null);

        var result = await _controller.GetMetadata(1);

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse>(notFoundResult.Value);
        Assert.False(value.Success);
    }

    [Fact]
    public async Task Upload_ReturnsCreated_WithValidFile()
    {
        var mockFile = new Mock<IFormFile>();
        mockFile.Setup(f => f.Length).Returns(1024);
        mockFile.Setup(f => f.FileName).Returns("test.pdf");

        var uploaded = new UploadedFileDto { Id = 1, FileName = "test.pdf" };
        _mockFileService.Setup(s => s.UploadAsync(mockFile.Object, null, null, false)).ReturnsAsync(uploaded);

        var result = await _controller.Upload(mockFile.Object);

        var objectResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(201, objectResult.StatusCode);
        var value = Assert.IsType<ApiResponse<UploadedFileDto>>(objectResult.Value);
        Assert.True(value.Success);
    }

    [Fact]
    public async Task Upload_ReturnsBadRequest_WhenFileIsNull()
    {
        var result = await _controller.Upload(null!);

        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse>(badRequestResult.Value);
        Assert.False(value.Success);
    }

    [Fact]
    public async Task Upload_ReturnsBadRequest_WhenFileIsEmpty()
    {
        var mockFile = new Mock<IFormFile>();
        mockFile.Setup(f => f.Length).Returns(0);

        var result = await _controller.Upload(mockFile.Object);

        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse>(badRequestResult.Value);
        Assert.False(value.Success);
    }

    [Fact]
    public async Task Download_ReturnsFile_WhenExists()
    {
        var stream = new MemoryStream(new byte[] { 1, 2, 3 });
        (Stream Stream, string ContentType, string FileName)? fileData = (stream, "application/pdf", "test.pdf");
        _mockFileService.Setup(s => s.DownloadAsync(1)).ReturnsAsync(fileData);

        var result = await _controller.Download(1);

        Assert.IsType<FileStreamResult>(result);
    }

    [Fact]
    public async Task Download_ReturnsNotFound_WhenFileDoesNotExist()
    {
        _mockFileService.Setup(s => s.DownloadAsync(1)).ReturnsAsync(((Stream, string, string)?)null);

        var result = await _controller.Download(1);

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var value = Assert.IsType<ApiResponse>(notFoundResult.Value);
        Assert.False(value.Success);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenSuccessful()
    {
        _mockFileService.Setup(s => s.DeleteAsync(1)).ReturnsAsync(true);

        var result = await _controller.Delete(1);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenFileDoesNotExist()
    {
        _mockFileService.Setup(s => s.DeleteAsync(1)).ReturnsAsync(false);

        var result = await _controller.Delete(1);

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var value = Assert.IsType<ApiResponse>(notFoundResult.Value);
        Assert.False(value.Success);
    }
}
