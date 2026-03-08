using AppTemplate.Application.Common.Models;
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
    private readonly Mock<ILogger<FilesController>> _mockLogger;
    private readonly FilesController _controller;

    public FilesControllerTests()
    {
        _mockMediator = new Mock<ISender>();
        _mockLogger = new Mock<ILogger<FilesController>>();
        _controller = new FilesController(_mockMediator.Object, _mockLogger.Object);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    #region GetFiles

    [Fact]
    public async Task GetFiles_ReturnsOk_WithPaginatedResponse()
    {
        // Arrange
        var pagedResult = PagedResult<UploadedFileDto>.Create(
            new List<UploadedFileDto>
            {
                new() { Id = 1, FileName = "file1.pdf", OriginalFileName = "report.pdf" },
                new() { Id = 2, FileName = "file2.png", OriginalFileName = "image.png" }
            },
            page: 1, pageSize: 20, totalItems: 2);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetFilesQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(pagedResult);

        // Act
        var result = await _controller.GetFiles(null, null);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PaginatedResponse<UploadedFileDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal(2, response.Data!.Count);
    }

    #endregion

    #region GetFile

    [Fact]
    public async Task GetFile_ReturnsOk_WhenFileExists()
    {
        // Arrange
        var fileDto = new UploadedFileDto
        {
            Id = 1,
            FileName = "file1.pdf",
            OriginalFileName = "report.pdf",
            ContentType = "application/pdf",
            FileSize = 1024
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetFileQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(fileDto);

        // Act
        var result = await _controller.GetFile(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<UploadedFileDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal(1, response.Data!.Id);
        Assert.Equal("report.pdf", response.Data.OriginalFileName);
    }

    [Fact]
    public async Task GetFile_ReturnsNotFound_WhenFileDoesNotExist()
    {
        // Arrange
        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetFileQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UploadedFileDto?)null);

        // Act
        var result = await _controller.GetFile(999);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal(404, notFoundResult.StatusCode);
        var response = Assert.IsType<ApiResponse>(notFoundResult.Value);
        Assert.False(response.Success);
    }

    #endregion

    #region UploadFile

    [Fact]
    public async Task UploadFile_Returns201_WhenSuccessful()
    {
        // Arrange
        var content = "file content"u8.ToArray();
        var formFile = new FormFile(new MemoryStream(content), 0, content.Length, "file", "test.pdf")
        {
            Headers = new HeaderDictionary(),
            ContentType = "application/pdf"
        };

        var uploadedFile = new UploadedFileDto
        {
            Id = 10,
            FileName = "stored-test.pdf",
            OriginalFileName = "test.pdf",
            ContentType = "application/pdf",
            FileSize = content.Length
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<UploadFileCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(uploadedFile);

        // Act
        var result = await _controller.UploadFile(formFile, "Test file", "documents", false);

        // Assert
        var statusResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(201, statusResult.StatusCode);
        var response = Assert.IsType<ApiResponse<UploadedFileDto>>(statusResult.Value);
        Assert.True(response.Success);
        Assert.Equal(10, response.Data!.Id);
    }

    [Fact]
    public async Task UploadFile_ReturnsBadRequest_WhenNoFileProvided()
    {
        // Act
        var result = await _controller.UploadFile(null!, null, null, false);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequestResult.StatusCode);
        var response = Assert.IsType<ApiResponse>(badRequestResult.Value);
        Assert.False(response.Success);
    }

    [Fact]
    public async Task UploadFile_ReturnsBadRequest_WhenFileIsEmpty()
    {
        // Arrange
        var formFile = new FormFile(new MemoryStream(), 0, 0, "file", "empty.pdf")
        {
            Headers = new HeaderDictionary(),
            ContentType = "application/pdf"
        };

        // Act
        var result = await _controller.UploadFile(formFile, null, null, false);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequestResult.StatusCode);
    }

    #endregion

    #region DownloadFile

    [Fact]
    public async Task DownloadFile_ReturnsFile_WhenFileExists()
    {
        // Arrange
        var fileContent = "file content"u8.ToArray();
        var downloadResult = new FileDownloadResult(
            new MemoryStream(fileContent),
            "application/pdf",
            "report.pdf");

        _mockMediator
            .Setup(m => m.Send(It.IsAny<DownloadFileQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(downloadResult);

        // Act
        var result = await _controller.DownloadFile(1);

        // Assert
        var fileResult = Assert.IsType<FileStreamResult>(result);
        Assert.Equal("application/pdf", fileResult.ContentType);
        Assert.Equal("report.pdf", fileResult.FileDownloadName);
    }

    [Fact]
    public async Task DownloadFile_ReturnsNotFound_WhenFileDoesNotExist()
    {
        // Arrange
        _mockMediator
            .Setup(m => m.Send(It.IsAny<DownloadFileQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((FileDownloadResult?)null);

        // Act
        var result = await _controller.DownloadFile(999);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal(404, notFoundResult.StatusCode);
    }

    #endregion

    #region DeleteFile

    [Fact]
    public async Task DeleteFile_ReturnsNoContent_WhenFileExists()
    {
        // Arrange
        _mockMediator
            .Setup(m => m.Send(It.IsAny<DeleteFileCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteFile(1);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task DeleteFile_ReturnsNotFound_WhenFileDoesNotExist()
    {
        // Arrange
        _mockMediator
            .Setup(m => m.Send(It.IsAny<DeleteFileCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteFile(999);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal(404, notFoundResult.StatusCode);
    }

    #endregion
}
