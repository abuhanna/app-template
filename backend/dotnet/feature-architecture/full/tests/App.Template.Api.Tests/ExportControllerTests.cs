using App.Template.Api.Common.Services;
using App.Template.Api.Features.Export;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace App.Template.Api.Tests;

public class ExportControllerTests
{
    private readonly Mock<IExportService> _mockExportService;
    private readonly ExportController _controller;

    public ExportControllerTests()
    {
        _mockExportService = new Mock<IExportService>();
        _controller = new ExportController(_mockExportService.Object);
    }

    [Fact]
    public async Task ExportCsv_ReturnsFileResult()
    {
        var data = new List<object> { new { Name = "Test" } };
        var csvBytes = System.Text.Encoding.UTF8.GetBytes("Name\nTest");
        _mockExportService
            .Setup(s => s.ExportToCsvAsync(It.IsAny<IEnumerable<object>>()))
            .ReturnsAsync(csvBytes);

        var result = await _controller.ExportCsv(data);

        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("text/csv", fileResult.ContentType);
    }

    [Fact]
    public async Task ExportExcel_ReturnsFileResult()
    {
        var data = new List<object> { new { Name = "Test" } };
        var excelBytes = new byte[] { 1, 2, 3 };
        _mockExportService
            .Setup(s => s.ExportToExcelAsync(It.IsAny<IEnumerable<object>>(), It.IsAny<string>()))
            .ReturnsAsync(excelBytes);

        var result = await _controller.ExportExcel(data);

        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileResult.ContentType);
    }

    [Fact]
    public async Task ExportPdf_ReturnsFileResult()
    {
        var data = new List<object> { new { Name = "Test" } };
        var pdfBytes = new byte[] { 1, 2, 3 };
        _mockExportService
            .Setup(s => s.ExportToPdfAsync(It.IsAny<IEnumerable<object>>(), It.IsAny<string>()))
            .ReturnsAsync(pdfBytes);

        var result = await _controller.ExportPdf(data);

        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/pdf", fileResult.ContentType);
    }
}
